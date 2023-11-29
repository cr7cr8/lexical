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




export class BannerNode extends ElementNode {

    constructor(...args) {
        super(...args)

    }

    static clone(node) {
        return new BannerNode(node.__key);
    }

    static getType() {
        return "banner";
    }

    static importJSON(...args) {

        return new BannerNode()

    }

    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "banner",
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
        console.log("updateDom", prevNode.__indent, this.__indent, dom)

        return true;
    }

    exportDOM(...args) {
        // console.log(super.exportDOM(...args).elem)
        // return  super.exportDOM(...args)
        // return document.createElement("span").append("abcd")
        console.log("exportDom", args)
        return {
            element: super.exportDOM(...args).element,
            after: function (generatedElement) {

                console.log("xxx", args[0]._config.theme.bannerGraph)

                if (this.__indent) {
                    generatedElement.style = `padding-inline-start: calc(${this.__indent * 40}px);`
                }

                //   generatedElement.classList.add(args[0]._config.theme.bannerGraph);
                //   generatedElement.className = args[0]._config.theme.bannerGraph
                //generatedElement.style = `color:red`


            }
        }
    }

    createDOM(config, editor) {

        //console.log(config)
        //super.createDOM(config,editor)//  --> works if extends paragraphnode
        const element = document.createElement("div")
        //element.className = config.theme.paragraph
        addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"
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
                editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined)
                shouldBanner && editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined)
                !shouldBanner && console.log("cannot banner the list")
            })

        }}>Banner</button>
    )
}