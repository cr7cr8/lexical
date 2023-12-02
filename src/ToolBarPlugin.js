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
    FOCUS_COMMAND,
    BLUR_COMMAND,
    COMMAND_PRIORITY_LOW

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


import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"

import { addClassNamesToElement } from "@lexical/utils"
import { $generateHtmlFromNodes } from '@lexical/html';
import parse from 'html-react-parser';



import { BeautifulMentionsPlugin, BeautifulMentionNode } from "lexical-beautiful-mentions";


import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

import { LinkCommandPlugin, INSERT_LINK_COMMAND, REMOVE_LINK_COMMAND } from "./LinkCommandPlugin"
import { SepNode } from './SepNode';

export function ToolBarPlugin({ buttons, ...props }) {

    const [editor] = useLexicalComposerContext()
    const [show, setShow] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const toolRef = useRef()



    useEffect(
        () => {
            document.onclick = function () {
                // setShow(false)
            }



            const remove1 = editor.registerCommand(
                FOCUS_COMMAND,
                () => {


                    return false
                },
                COMMAND_PRIORITY_LOW
            )

            const remove2 = editor.registerCommand(
                BLUR_COMMAND,
                () => {
                    //    console.log(document.getElementById("inputurl") === document.activeElement)

                    //setShow(false)
                    //    console.log(document.getElementById("inputurl"), document.activeElement)
                    // setTimeout(function () { setShow(false) }, 500)
                    return false
                },
                COMMAND_PRIORITY_LOW
            )

            return function () {
                document.onclick = undefined

                remove1()
                remove2()
            }

        }, [])

    useEffect(() => {
        return editor.registerUpdateListener(listener => {

            editor.getEditorState().read(() => {

                const selection = $getSelection()

                if ($isRangeSelection(selection)) {
                    setShow(!selection?.isCollapsed())

                    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                        setX(window.getSelection().getRangeAt(0).getBoundingClientRect().x)
                        setY(window.getSelection().getRangeAt(0).getBoundingClientRect().y)
                    }
                }
            })

        })

    }, [editor])

    return (

        <div
            onClick={function (e) { e.stopPropagation() }}
            style={{
                padding: "8px", backgroundColor: "lightgray", position: "absolute", left: x, top: y, display: show ? "block" : "none", transform: `translateX(0%) translateY(-100%)`
            }}
            ref={toolRef}>
            {
                buttons.map((button, index) => { return <span key={index} >{button}</span> })
            }
        </div>
    )
}


export function FormatButton() {
    const [editor] = useLexicalComposerContext()

    return (
        <div>{
            ['Bold', 'Italic', 'Underline', 'Code', 'Highlight', 'Strikethrough', 'Subscript', 'Superscript']
                .map((value, index) => <button key={index} onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, value.toLowerCase())


                


                    // editor.update(() => {
                    //     const selection = $getSelection() 
                    //     $getSelection().getNodes().shift()?.insertBefore(new SepNode())
                    //     $getSelection().getNodes().pop()?.insertAfter(new SepNode())


                    //     const newSelection = $createRangeSelection();
                    //     newSelection.anchor.set(selection.focus.key, selection.focus.offset, "text")
                    //     newSelection.focus.set(selection.focus.key, selection.focus.offset, "text")
                    //     newSelection.format = selection.format
                    //     $setSelection(newSelection)

                    // })



                }}>{value}</button>)
        }
        </div>
    )

}

export function HistoryButton() {

    const [editor] = useLexicalComposerContext()

    return (
        <div>
            <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>Undo</button>
            <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>Redo</button>
        </div>
    )
}

export function ListButton() {
    const [editor] = useLexicalComposerContext()
    return (
        <>
            <button onClick={function () { editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, null) }}>List</button>





            <button onClick={function () { editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, null) }}>List2</button>


        </>
    )

}
export function AlignButton() {

    const [editor] = useLexicalComposerContext()

    return (
        <div>
            {['Left', 'Center', 'Right', 'Justify',].
                map((value, index) => <button key={index} onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value.toLowerCase())
                }} >{value}</button>)
            }
        </div>
    )
}

export function IndentButton() {
    const [editor] = useLexicalComposerContext()

    return (
        <>
            <button onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>Indent</button>
            <button onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>Outdent</button>
        </>

    )
}
export function LinkButton() {

    const [editor] = useLexicalComposerContext()
    const [url, setUrl] = useState("")
    const inputRef = useRef()

    //$selectAll(selection): void

    useEffect(() => {
        return editor.registerUpdateListener(() => {

            editor.getEditorState().read(() => {
                setUrl("")
                const selection = $getSelection()
                if (selection && $isRangeSelection(selection) && !selection.isCollapsed()) {
                    let selectedNodes = selection.getNodes()
                    selectedNodes = selection.isBackward() ? selectedNodes.reverse() : selectedNodes
                    selectedNodes.forEach(node => {

                        if ((node.__type === "text") && (node.getParent().__type === "link")) {
                            setUrl(node.getParent().__url)
                        }

                    })
                }

            })

        })

    }, [editor])

    return (
        <>
            <input
                ref={inputRef}
                value={url} onChange={function (e) { setUrl(e.target.value) }}
                onClick={e => {
                    e.stopPropagation()

                    // editor.update(() => {
                    //     const selection = $getSelection()
                    //     if (selection && $isRangeSelection(selection) && !selection.isCollapsed()) {
                    //         $patchStyleText(selection, { "background": "lightgray", })
                    //     }
                    //    setTimeout(() => {
                    //     inputRef.current.focus()
                    //    }, 200); 
                    // })

                }}
            />
            <button onClick={function (e) {
                e.stopPropagation()
                editor.dispatchCommand(REMOVE_LINK_COMMAND, "abcdefght")
                //     setTimeout(() => {
                editor.dispatchCommand(INSERT_LINK_COMMAND, url)
                //     }, 100);


            }}>Link</button>
            <button onClick={function (e) {
                e.stopPropagation()
                editor.dispatchCommand(REMOVE_LINK_COMMAND, "abcdefght")
            }}>Remove</button>

        </>
    )

}





