import {
    ParagraphNode, ElementNode,
    createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode,
    TextNode, $getNodeByKey, $getSelection, $isRangeSelection, $setSelection, RangeSelection, $createRangeSelection,
    BLUR_COMMAND, FOCUS_COMMAND, COMMAND_PRIORITY_LOW

} from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef, useState } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'

import { SepNode, INSERT_SEP_COMMAN, SepNodePlugin } from "./SepNode"

import { $setBlocksType, $patchStyleText, $cloneWithProperties, $sliceSelectedTextNodeContent, $wrapNodes, $addNodeStyle } from '@lexical/selection'


export const FORMAT_HEADING_COMMAND = createCommand("formatHeading");
export function HeadingCommandPlugin() {

    const [editor] = useLexicalComposerContext()
    useEffect(() => {

        // editor.registerNodeTransform

        editor.registerCommand(FORMAT_HEADING_COMMAND, (tag, lexcicalEditor) => {

            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(tag));
            }

        }, COMMAND_PRIORITY_NORMAL)

    }, [])

    return (<></>)
}

export function HeadingButton() {

    const [editor] = useLexicalComposerContext()

    return (
        <>
            {/* <button onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>Outdent</button>
          <button onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>Indent</button>
          <br /> */}

            {["H1", "H2", "H3", "H4", "H5", "H6"].map((value, index) => {

                return <button key={index} onClick={() => {
                    editor.dispatchCommand(FORMAT_HEADING_COMMAND, value.toLowerCase(), "==" + value, "3##$#")
                }}>{value}</button>

            })}

        </>
    )

}