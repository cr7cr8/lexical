import toStyleString from 'to-style/src/toStyleString';
import toStyle from 'to-style';
import { computePosition, flip, shift } from '@floating-ui/dom';
import { useEffect, useState, useMemo, useLayoutEffect, forwardRef, useRef } from 'react';
import {
    $getRoot, $getSelection, $createParagraphNode, $createTextNode, $isRangeSelection, ParagraphNode, $setSelection, $isRootNode,
    $insertNodes, TextNode, $createRangeSelection,
    createCommand,
    UNDO_COMMAND, REDO_COMMAND,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    INDENT_CONTENT_COMMAND,
    COMMAND_PRIORITY_NORMAL,
    ElementNode,
    $getNodeByKey,
    DecoratorNode,

} from 'lexical';
import { LexicalComposer, } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
//import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { RichTextPlugin, richTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { $setBlocksType, $patchStyleText, $isAtNodeEnd } from '@lexical/selection'
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'


import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"

import {
    ListNode, ListItemNode, $createListNode, $createListItemNode,
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND
} from "@lexical/list"


import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"

import { ToolBarPlugin, FormatButton, AlignButton, HistoryButton, IndentButton, ListButton } from './ToolBarPlugin';
import { LinkCommandPlugin, LinkButton } from "./LinkCommandPlugin"
import { HeadingCommandPlugin, HeadingButton } from './HeadingCommandPlugin';

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"

import { addClassNamesToElement } from "@lexical/utils"
import { $generateHtmlFromNodes } from '@lexical/html';
//import parse from 'html-react-parser';


import TreeViewPlugin from "./TreeViewPlugin";

import { BeautifulMentionsPlugin, BeautifulMentionNode } from "lexical-beautiful-mentions";


import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

import { MentionPlugin } from "./MentionPlugin"
import { MentionNode } from './MentionNode';
import { SepNode } from './SepNode';




//export class BannerNode extends ParagraphNode {
export class BannerNode1 extends ElementNode {

    constructor(bgColor) {
        super()
        this.bgColor = bgColor

    }

    setBgColor(value) {
        const self = this.getWritable();
        self.bgColor = value;
    }

    isInline() {
        return false
    }


    static clone(node) {
        return new BannerNode1(node.bgColor);


    }

    static getType() {
        return "BannerNode1";
    }

    static importJSON(...args) {
        const { bgColor, indent, format } = args[0]

        const banner = new BannerNode1(bgColor)
        banner.setIndent(indent)
        banner.setFormat(format)
        console.log(args[0])

        return banner
    }

    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "BannerNode1",
            bgColor: this.bgColor,

            //    version: 1,
            //   children: [],
            //customValue: "anything you like",
            //   format: "",
            //  indent: 1,
            //  direction: null,

        };
    }

    /**
        * Returning false tells Lexical that this node does not need its
        * DOM element replacing with a new copy from createDOM.
        */
    updateDOM(prevNode, dom, config) {
        //updateDOM( ...args) {

        // console.log("updateDom1", prevNode, this, dom, config)
        return true;
    }

    exportDOM(...args) {

        return {
            element: super.exportDOM(...args).element,
            after: function (generatedElement) {


                const styleObj = {
                    ...this.__format && { textAlign: ["left", "center", "right", "justify"][this.__format - 1] },
                    ...this.__indent && { paddingInlineStart: `calc(${this.__indent * 40}px)` },
                    ...this.bgColor && { backgroundColor: this.bgColor },
                    borderWidth: "thick",
                    borderStyle: "solid",
                    width: "100%"
                }

                generatedElement.style = toStyleString(styleObj)



            }
        }
    }



    createDOM(config, editor) {

        //   element cannot have siblings
        // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("table")
        //element.className = config.theme.paragraph
        //  addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"

        element.style.borderWidth = "thick"
        element.style.borderStyle = "solid"
        element.style.width = "100%"

        return element;
    }




    /**
     * Node should be set to paragraph when user delete all content
     */
    collapseAtStart(rangeSelection) {
        //  const paragraph = $createParagraphNode();
        //  const children = this.getChildren();
        //  children.forEach((child) => paragraph.append(child));
        //  this.replace(paragraph,true);

        if (this.getChildrenSize() === 0) {

            this.remove()
        }
        else if (this.getFirstChild().getType() === "linebreak") {

            this.getFirstChild().remove()
        }
        else {

            this.replace($createParagraphNode(), true)

            return true;
        }


    }



    insertNewAfter(rangeSelection, shouldRestoreSelection) {

        console.log($isAtNodeEnd(rangeSelection.focus), rangeSelection)



        if (($isAtNodeEnd(rangeSelection.focus)) && (this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            //if ((this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            const paragraph = $createParagraphNode();
            const direction = this.getDirection();
            paragraph.setDirection(direction);
            this.insertAfter(paragraph, shouldRestoreSelection);
            this.getLastChild().remove()
            return paragraph;
        }
        // if (($getNodeByKey(rangeSelection.focus.key).getType() === "banner")&&(this.getLastChild().getType() === "linebreak")) {
        //     console.log(shouldRestoreSelection, rangeSelection)
        //     const paragraph = $createParagraphNode();
        //     const direction = this.getDirection();
        //     paragraph.setDirection(direction);
        //     this.insertAfter(paragraph, shouldRestoreSelection);
        //     console.log(this.getLastChild().getType())
        //     this.getLastChild().remove()

        //      return paragraph;
        // }
        // if (this.getLastChild().getType() === "linebreak") {
        //     const paragraph = $createParagraphNode();
        //     const direction = this.getDirection();
        //     paragraph.setDirection(direction);
        //     this.insertAfter(paragraph, shouldRestoreSelection);
        //     this.getLastChild().remove()

        //     return paragraph;
        // }
        else {

            //   console.log(shouldRestoreSelection, rangeSelection)
            return super.insertNewAfter(rangeSelection, shouldRestoreSelection)
        }


    }


}
export class BannerNode2 extends ElementNode {

    constructor(bgColor) {
        super()
        this.bgColor = bgColor

    }

    setBgColor(value) {
        const self = this.getWritable();
        self.bgColor = value;
    }

    isInline() {
        return false
    }


    static clone(node) {
        return new BannerNode2(node.bgColor);


    }

    static getType() {
        return "BannerNode2";
    }

    static importJSON(...args) {
        const { bgColor, indent, format } = args[0]

        const banner = new BannerNode2(bgColor)
        banner.setIndent(indent)
        banner.setFormat(format)
        console.log(args[0])

        return banner
    }

    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "BannerNode2",
            bgColor: this.bgColor,

            //    version: 1,
            //   children: [],
            //customValue: "anything you like",
            //   format: "",
            //  indent: 1,
            //  direction: null,

        };
    }

    /**
        * Returning false tells Lexical that this node does not need its
        * DOM element replacing with a new copy from createDOM.
        */
    updateDOM(prevNode, dom, config) {
        //updateDOM( ...args) {
        // console.log("updateDom", prevNode, this, dom)
        console.log("updateDom2", prevNode, this, dom, config)
        return true;
    }

    exportDOM(...args) {

        return {
            element: super.exportDOM(...args).element,
            after: function (generatedElement) {


                const styleObj = {
                    //  ...this.__format && { textAlign: ["left", "center", "right", "justify"][this.__format - 1] },
                    //  ...this.__indent && { paddingInlineStart: `calc(${this.__indent * 40}px)` },
                    //  ...this.bgColor && { backgroundColor: this.bgColor },
                    display: "flex",
                    backgroundColor: "#DEB887",
                    gap: "4px",
                    margin: "4px",
                }

                generatedElement.style = toStyleString(styleObj)



            }
        }
    }


    createDOM(config, editor) {

        //   element cannot have siblings
        // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("tr")
        //element.className = config.theme.paragraph
        //addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"
        // element.style.borderColor = "green"
        // element.style.borderWidth = "1px"
        // element.style.borderStyle = "solid"

        element.style.display = "flex"
        element.style.backgroundColor = "#DEB887"
        element.style.gap = "4px"
        element.style.margin = "4px"
        return element;
    }




    /**
     * Node should be set to paragraph when user delete all content
     */
    collapseAtStart(rangeSelection) {
        //  const paragraph = $createParagraphNode();
        //  const children = this.getChildren();
        //  children.forEach((child) => paragraph.append(child));
        //  this.replace(paragraph,true);

        if (this.getChildrenSize() === 0) {

            this.remove()
        }
        else if (this.getFirstChild().getType() === "linebreak") {

            this.getFirstChild().remove()
        }
        else {

            this.replace($createParagraphNode(), true)

            return true;
        }


    }



    insertNewAfter(rangeSelection, shouldRestoreSelection) {

        console.log($isAtNodeEnd(rangeSelection.focus), rangeSelection)



        if (($isAtNodeEnd(rangeSelection.focus)) && (this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            //if ((this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            const paragraph = $createParagraphNode();
            const direction = this.getDirection();
            paragraph.setDirection(direction);
            this.insertAfter(paragraph, shouldRestoreSelection);
            this.getLastChild().remove()
            return paragraph;
        }

        else {


            return super.insertNewAfter(rangeSelection, shouldRestoreSelection)
        }


    }


}
export class BannerNode3 extends ElementNode {

    constructor(bgColor) {
        super()
        this.bgColor = bgColor
        this.width = 0
    }

    setBgColor(value) {
        const self = this.getWritable();
        self.bgColor = value;
    }
    setWidth(value) {
        const self = this.getWritable();
        self.width = value;
    }

    isInline() {
        return false
    }


    static clone(node) {
        return new BannerNode3(node.bgColor);


    }

    static getType() {
        return "BannerNode3";
    }

    static importJSON(...args) {
        const { bgColor, indent, format } = args[0]

        const banner = new BannerNode3(bgColor)
        banner.setIndent(indent)
        banner.setFormat(format)
        console.log(args[0])

        return banner
    }

    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "BannerNode3",
            bgColor: this.bgColor,

            //    version: 1,
            //   children: [],
            //customValue: "anything you like",
            //   format: "",
            //  indent: 1,
            //  direction: null,

        };
    }

    /**
        * Returning false tells Lexical that this node does not need its
        * DOM element replacing with a new copy from createDOM.
        */
    updateDOM(prevNode, dom, config) {
        //updateDOM( ...args) {
        console.log("updateDom3", prevNode, this, dom, config)

        return true;
    }

    exportDOM(...args) {

        return {
            element: super.exportDOM(...args).element,
            after: function (generatedElement) {


                const styleObj = {
                    ...this.__format && { textAlign: ["left", "center", "right", "justify"][this.__format - 1] },
                    ...this.__indent && { paddingInlineStart: `calc(${this.__indent * 40}px)` },
                    ...this.bgColor && { backgroundColor: this.bgColor },


                    borderWidth: "1px",
                    borderStyle: "solid",
                    width: `calc(25% + ${this.width}px)`,
                    display: "inline-block"

                }

                generatedElement.className = "tr_css"
                generatedElement.style = toStyleString(styleObj)



            }
        }
    }



    // createDOM(config, editor) {




    //     // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
    //     const element = document.createElement("td")
    //     const btn = document.createElement("button")
    //     btn.style.position = "absolute"
    //     btn.innerText = "cell"
    //     btn.style.right = "4px"
    //     btn.onclick = (e) => {
    //         // console.log(this)
    //         // console.log(editor.getEditorState())
    //         editor.update(() => {
    //             e.preventDefault()
    //             this.setBgColor("gray") // cannot use
    //             console.log(editor)

    //         })
    //     }
    //     //element.className = config.theme.paragraph
    //     // addClassNamesToElement(element, config.theme.bannerGraph)
    //     // element.style = "background: skyblue"

    //     //    element.style.backgroundColor = "#" + Math.floor(Math.random() * 16777215).toString(16);// this.bgColor
    //     element.style.backgroundColor = this.bgColor
    //     element.style.borderWidth = "1px"
    //     element.style.borderStyle = "solid"
    //     element.style.width = "25%"
    //     element.style.display = "inline-block"
    //     element.style.position = "relative"



    //     btn.style.userSelect = "none"

    //     let show = false
    //     this.getChildren().forEach(child => {
    //         if (child.getKey() === $getSelection()?.focus?.key) {
    //             show = true
    //         }

    //     })
    //     if (this.__key === $getSelection()?.focus?.key) {
    //         show = true
    //     }

    //     //  btn.style.display = show ? "block" : "none"
    //     // if (show || (this.__key === $getSelection()?.focus?.key)) {
    //     //     btn.style.display = "block"
    //     // }
    //     // else {
    //     //     btn.style.display = "none"
    //     // }

    //     //  console.log(this.__key, $getSelection()?.focus?.key, this.getChildren().map(n => n.getKey()), this.__key === $getSelection()?.focus?.key)
    //     if (show) {
    //         console.log(this.getKey(), "true")
    //         btn.style.display = "block"
    //     }
    //     else {
    //         console.log(this.getKey(), "false")
    //         btn.style.display = "none"
    //     }

    //     //    btn.style.display = show ? "block" : "none"
    //     show && element.appendChild(btn)
    //     return element;
    // }

    createDOM(config, editor) {




        // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("td")

        //element.className = config.theme.paragraph
        // addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"

        //    element.style.backgroundColor = "#" + Math.floor(Math.random() * 16777215).toString(16);// this.bgColor
        element.style.backgroundColor = this.bgColor
        element.style.borderWidth = "1px"
        element.style.borderStyle = "solid"
        element.style.width = `calc(25% + ${this.width}px)`
        element.style.display = "inline-block"
        element.style.position = "relative"
        element.id = this.__key





        return element;
    }




    /**
     * Node should be set to paragraph when user delete all content
     */
    collapseAtStart(rangeSelection) {
        //  const paragraph = $createParagraphNode();
        //  const children = this.getChildren();
        //  children.forEach((child) => paragraph.append(child));
        //  this.replace(paragraph,true);

        if (this.getChildrenSize() === 0) {

            this.remove()
        }
        else if (this.getFirstChild().getType() === "linebreak") {

            this.getFirstChild().remove()
        }
        else {

            this.replace($createParagraphNode(), true)

            return true;
        }


    }



    insertNewAfter(rangeSelection, shouldRestoreSelection) {

        //    console.log($isAtNodeEnd(rangeSelection.focus), rangeSelection)



        if (($isAtNodeEnd(rangeSelection.focus)) && (this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            //if ((this.getLastChild().getType() === "linebreak") && ($getNodeByKey(rangeSelection.focus.key).getType() === "banner")) {
            const paragraph = $createParagraphNode();
            const direction = this.getDirection();
            paragraph.setDirection(direction);
            this.insertAfter(paragraph, shouldRestoreSelection);
            this.getLastChild().remove()
            return paragraph;
        }

        else {


            return super.insertNewAfter(rangeSelection, shouldRestoreSelection)
        }


    }


}






export const INSERT_BANNER_COMMAND1 = createCommand("INSERT_BANNER_COMMAND")

export function BannerCommandPlugin1() {

    const [editor] = useLexicalComposerContext()
    if (!editor.hasNode(BannerNode1)) { throw new Error('BannerPlugin: "BannerNode1" not registered on editor'); }




    useEffect(() => {



        const remove1 = editor.registerCommand(
            INSERT_BANNER_COMMAND1,
            () => {



                const selection = $getSelection();

                const allNodes = selection.getNodes()
                //   console.log(allNodes)

                let node = allNodes[0]


                while (node.getParent().getType() !== "root") {
                    node = node.getParent()
                }
                //console.log(node)

                const b1 = new BannerNode1()

                const b2 = new BannerNode2()
                const b2_2 = new BannerNode2()

                // const b3 = new BannerNode3()//.append(new ParagraphNode())
                // const b3_2 = new BannerNode3()//.append(new ParagraphNode())

                // const b3_3 = new BannerNode3()//.append(new ParagraphNode())
                // const b3_4 = new BannerNode3()//.append(new ParagraphNode())
                // const b3_5 = new BannerNode3()//.append(new ParagraphNode())


                const b3 = new BannerNode3().append(new CellNode())
                const b3_2 = new BannerNode3().append(new CellNode())

                const b3_3 = new BannerNode3().append(new CellNode())
                const b3_4 = new BannerNode3().append(new CellNode())
                const b3_5 = new BannerNode3().append(new CellNode())



                b2.append(b3)
                b2.append(b3_2)

                b2_2.append(b3_3)
                b2_2.append(b3_4)
                b2_2.append(b3_5)



                b1.append(b2)
                b1.append(b2_2)

                if (node.getChildrenSize() == 0) {
                    node.replace(b1, true)
                }
                else {
                    node.insertAfter(b1, true)
                }

                // console.log(allNodes[0].getFirstDescendant())
                // console.log("is at node end", $isAtNodeEnd(selection.focus))
                // console.log(selection)
                // allNodes[0].isChil



                // if ($isRangeSelection(selection)) {
                //     $setBlocksType(selection, $createBannerNode);
                // }
                return true;
            },

            COMMAND_PRIORITY_NORMAL,
        );

        return function () {

            remove1()
        }


    }, [editor])



    return <></>




}

export function BannerButton1() {

    const [editor] = useLexicalComposerContext()

    return (
        <button onClick={() => {

            editor.getEditorState().read(() => {
                let shouldBanner = true

                const allNodes = $getSelection().getNodes()
                allNodes.forEach(node => {
                    node.getParents().forEach(parent => {
                        if (parent.getType() === "list") {
                            shouldBanner = false
                        }
                    })
                })
                // editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined)
                shouldBanner && editor.dispatchCommand(INSERT_BANNER_COMMAND1, undefined)
                !shouldBanner && console.log("cannot banner the list")
            })

        }}>MyTable</button>
    )
}

export class CellNode extends DecoratorNode {

    constructor() {
        super()
        this.show = false
    }
    setShow(value) {
        const self = this.getWritable()
        self.show = value
    }
    getShow() {
        return this.show
    }

    static getType() {
        return "CellNode";
    }

    static clone(node) {
        return new CellNode();
    }
    isInline() {
        return true
    }
    isIsolated() {
        return true
    }
    updateDOM() {
        return true
    }

    static importJSON(...args) {
        //   console.log(args)
        const { type } = args[0]
        return new CellNode()
    }
    exportJSON() {

        return {
            //   ...super.exportJSON(), // this one is not extended
            type: "CellNode",
            version: 2.0,

        };

    }


    createDOM(config) {

        const element = document.createElement("span")
        addClassNamesToElement(element, config.theme.cellNode)
        return element;

    }
    decorate(...args) {
        //  console.log(args)
        return <CellReactNode {...args} node={this} />
        //return <MyComponent {...args} node={this} />
    }

}

function CellReactNode(props) {

    const node = props.node
    const [editor] = useLexicalComposerContext()
    const [show, setShow] = useState(false)

    const startX = useRef(0)
    const startY = useRef(0)

    const [preMoveX, setPreMoveX] = useState(0)
    const [preMoveY, setPreMoveY] = useState(0)

    const [moveX, setMoveX] = useState(0)
    const [moveY, setMoveY] = useState(0)

    useEffect(() => {
        const remove1 = editor.registerUpdateListener(() => {

            editor.update(() => {
                const selection = $getSelection()

                if (!selection) return


                const shouldShow = (node.getParent().getChildren().filter(n => {
                    return n.isSelected()
                }).length > 0) || (selection.focus.key === node.getParent().getKey())

                if (show !== shouldShow) setShow(shouldShow)

            })

        })

        return function () {
            remove1()
        }

    }, [editor, show])


    return (
        <button style={{ position: "absolute", left: preMoveX + moveX, top: preMoveY + moveY, display: show ? "block" : "none", zIndex: 1000 }}
            draggable="true"
            onClick={function (e) {

                editor.update(() => {

                    const b3 = new BannerNode3()
                    b3.append(new CellNode())
                    node.getParent().insertAfter(b3)

                })

            }}
            onDragStart={function (e) {

                console.log("Start", preMoveX + moveX, preMoveY + moveY,)
                startX.current = e.pageX //+ moveX
                startY.current = e.pageY //+ moveY
                // console.log("dragStart", e.clientX + "--" + e.clientY, e.movementX + "--" + e.movementY, e.screenX + "--" + e.screenY, e.pageX + "--" + e.pageY)

            }}
            onDrag={function (e) {
        

                setMoveX(e.pageX - startX.current)
                setMoveY(e.pageY - startY.current)
          

            
            }}
            onDragEnd={function (e) {
             


                setPreMoveX(moveX + preMoveX)
                setPreMoveY(moveY + preMoveY)
                console.log("End", moveX + preMoveX, moveY + preMoveY, moveX, moveY)


                setMoveX(0)
                setMoveY(0)

                // editor.update(()=>{
                //     node.getParent().setWidth(moveX)
                // })
                


            }}



        >O</button>
    )

}