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

} from 'lexical';
import { LexicalComposer, } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
//import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { RichTextPlugin, richTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { $setBlocksType, $patchStyleText } from '@lexical/selection'
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


    static clone(node) {
        return new BannerNode(node.__key);
    }

    static getType() {
        return "banner";
    }

    /**
        * Returning false tells Lexical that this node does not need its
        * DOM element replacing with a new copy from createDOM.
        */
    updateDOM(_prevNode, _dom, _config) {
        return false;
    }


    createDOM(config, editor) {
        const element = document.createElement("div")
        //element.className = config.theme.paragraph
        addClassNamesToElement(element, config.theme.bannerGraph)
        // element.style = "background: skyblue"
        return element;
    }

    static importJSON(...args) {
        return super.importJSON(...args)
    }



    exportJSON() {


        // console.log("====",{...super.exportJSON()})
        return {
            ...super.exportJSON(),
            type: "banner",
            //    version: 1,
            //   children: [],
            customValue: "anything you like",
            //   format: "",
            //  indent: 1,
            //  direction: null,

        };
    }


    /**
     * Node should be set to paragraph when user delete all content
     */
    collapseAtStart(rangeSelection) {
        const paragraph = $createParagraphNode();
        const children = this.getChildren();
        children.forEach((child) => paragraph.append(child));
        this.replace(paragraph);

        return true;
    }

    /**
     * Node should be set to paragraph when user press Enter.
     * Node will remain the same on Shift+Enter
     */
    insertNewAfter(rangeSelection, shouldRestoreSelection) {
        console.log(shouldRestoreSelection)
        const paragraph = $createParagraphNode();
        const direction = this.getDirection();
        paragraph.setDirection(direction);
        this.insertAfter(paragraph, shouldRestoreSelection);

        return paragraph;
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
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, $createBannerNode);
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
        <button onClick={() => { editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined) }}>Banner</button>
    )
}