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
        // console.log("updateDom", prevNode, this, dom)

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
                    display:"flex",
                    backgroundColor:"#DEB887",
                    gap:"4px",
                    margin:"4px",
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

        element.style.display ="flex"
        element.style.backgroundColor = "#DEB887"
        element.style.gap="4px"
        element.style.margin="4px"
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

    }

    setBgColor(value) {
        const self = this.getWritable();
        self.bgColor = value;
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
        // console.log("updateDom", prevNode, this, dom)

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
                    width: "25%",
                    display: "inline-block"

                }

                generatedElement.className = "tr_css"
                generatedElement.style = toStyleString(styleObj)



            }
        }
    }


    createDOM(config, editor) {

        //   element cannot have siblings
        // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("td")
        //element.className = config.theme.paragraph
        // addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"
        //     if (this.bgColor) {
        element.style.backgroundColor = this.bgColor
        element.style.borderWidth = "1px"
        element.style.borderStyle = "solid"
        element.style.width = "25%"
        element.style.display = "inline-block"
        //    }
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






export const INSERT_BANNER_COMMAND1 = createCommand("INSERT_BANNER_COMMAND")

export function BannerCommandPlugin1() {

    const [editor] = useLexicalComposerContext()
    if (!editor.hasNode(BannerNode1)) { throw new Error('BannerPlugin: "BannerNode1" not registered on editor'); }

    useEffect(() => {

        return editor.registerCommand(
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

                const b3 = new BannerNode3().append(new ParagraphNode())
                const b3_2 = new BannerNode3().append(new ParagraphNode())

                const b3_3 = new BannerNode3().append(new ParagraphNode())
                const b3_4 = new BannerNode3().append(new ParagraphNode())
                const b3_5 = new BannerNode3().append(new ParagraphNode())


                b2.append(b3)
                b2.append(b3_2)

                b2_2.append(b3_3)
                b2_2.append(b3_4)
                b2_2.append(b3_5)



                b1.append(b2)
                b1.append(b2_2)


                node.replace(b1, true)

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



    }, [editor])






    return (
        <></>
    )

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

