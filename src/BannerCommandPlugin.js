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
import parse from 'html-react-parser';


import TreeViewPlugin from "./TreeViewPlugin";

import { BeautifulMentionsPlugin, BeautifulMentionNode } from "lexical-beautiful-mentions";


import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

import { MentionPlugin } from "./MentionPlugin"
import { MentionNode } from './MentionNode';
import { SepNode } from './SepNode';




//export class BannerNode extends ParagraphNode {
export class BannerNode extends ElementNode {

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
        return new BannerNode(node.bgColor);


    }

    static getType() {
        return "banner";
    }

    static importJSON(...args) {
        const { bgColor, indent, format } = args[0]

        const banner = new BannerNode(bgColor)
        banner.setIndent(indent)
        banner.setFormat(format)
        console.log(args[0])

        return banner
    }

    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "banner",
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
                    ...this.bgColor && { backgroundColor: this.bgColor }
                }

                generatedElement.style = toStyleString(styleObj)



            }
        }
    }

    createDOM(config, editor) {

        //console.log(config)
        // const element =super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("div")
        //element.className = config.theme.paragraph
        addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"
        if (this.bgColor) {
            element.style.backgroundColor = this.bgColor
        }
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

    /**
     * Node should be set to paragraph when user press Enter.
     * Node will remain the same on Shift+Enter
     */
    // insertNewAfter(rangeSelection, shouldRestoreSelection) {

    //     // if (($isAtNodeEnd(rangeSelection.focus))&&(this.getLastChild().getType() === "linebreak")) {
    //     //     const paragraph = $createParagraphNode();
    //     //     const direction = this.getDirection();
    //     //     paragraph.setDirection(direction);
    //     //     this.insertAfter(paragraph, shouldRestoreSelection);
    //     //     return paragraph;
    //     // }
    //     // if (($getNodeByKey(rangeSelection.focus.key).getType() === "banner")&&(this.getLastChild().getType() === "linebreak")) {
    //     //     console.log(shouldRestoreSelection, rangeSelection)
    //         const paragraph = $createParagraphNode();
    //         const direction = this.getDirection();
    //         paragraph.setDirection(direction);
    //         this.insertAfter(paragraph, shouldRestoreSelection);
    //     //     console.log(this.getLastChild().getType())
    //     //     this.getLastChild().remove()

    //          return paragraph;
    //     // }
    //     // if (this.getLastChild().getType() === "linebreak") {
    //     //     const paragraph = $createParagraphNode();
    //     //     const direction = this.getDirection();
    //     //     paragraph.setDirection(direction);
    //     //     this.insertAfter(paragraph, shouldRestoreSelection);
    //     //     this.getLastChild().remove()

    //     //     return paragraph;
    //     // }
    //    // else {

    //         console.log(shouldRestoreSelection, rangeSelection)
    //         return super.insertNewAfter(rangeSelection, shouldRestoreSelection)
    //    // }


    // }

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
export const $createBannerNode = () => {

    return new BannerNode()

}

export const INSERT_BANNER_COMMAND = createCommand("INSERT_BANNER_COMMAND")
export const CHANGE_BANNER_COLOR_COMMAND = createCommand("CHANGE_BANNER_COLOR_COMMAND")
export function BannerCommandPlugin() {

    const [editor] = useLexicalComposerContext()
    if (!editor.hasNode(BannerNode)) { throw new Error('BannerPlugin: "BannerNode" not registered on editor'); }

    useEffect(() => {

        return editor.registerCommand(
            INSERT_BANNER_COMMAND,
            () => {



                const selection = $getSelection();

                const allNodes = selection.getNodes()
                //   console.log(allNodes)

                let node = allNodes[0]


                while (node.getParent().getType() !== "root") {
                    node = node.getParent()
                }
                //console.log(node)
                node.replace(new BannerNode(), true)

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

    useEffect(() => {

        return editor.registerCommand(
            CHANGE_BANNER_COLOR_COMMAND,
            (color) => {



                const selection = $getSelection();

                const allNodes = selection.getNodes()
                //   console.log(allNodes)

                let node = allNodes[0]


                while ((node.getType() !== "banner") && (node.getType() !== "root")) {
                    node = node.getParent()
                }
                //console.log(node)
                if (node.getType() == "banner") {
                    node.setBgColor(color)
                }


                return true;
            },

            COMMAND_PRIORITY_NORMAL,
        );



    }, [editor])




    return (
        <></>
    )

}

export function BannerButton() {

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
                shouldBanner && editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined)
                !shouldBanner && console.log("cannot banner the list")
            })

        }}>Banner</button>
    )
}

export function BannerColorButton() {

    const [editor] = useLexicalComposerContext()

    return (
        <button onClick={() => {

            editor.getEditorState().read(() => {
                editor.dispatchCommand(CHANGE_BANNER_COLOR_COMMAND, "#" + Math.floor(Math.random() * 16777215).toString(16))

            })

        }}>BannerColour</button>
    )
}