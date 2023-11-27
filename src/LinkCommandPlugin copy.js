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


import { SepNode, INSERT_SEP_COMMAN, SepNodePlugin } from "./SepNode"

import { $setBlocksType, $patchStyleText, $cloneWithProperties, $sliceSelectedTextNodeContent, $wrapNodes, $addNodeStyle } from '@lexical/selection'

export const INSERT_LINK_COMMAND = createCommand("insertLink")
export const REMOVE_LINK_COMMAND = createCommand("removeLink")
export function LinkCommandPlugin() {

    const [editor] = useLexicalComposerContext()

    useEffect(() => {


        const remove1 = editor.registerCommand(
            INSERT_LINK_COMMAND,
            function (address) {
                const selection = $getSelection()


                if (!$isRangeSelection(selection) || selection.isCollapsed()) {
                    console.log("not good selection")
                    return
                }
                const selectecdNodes = selection.getNodes()
            


                selectecdNodes.forEach(node => {
                    const parentsType = node.getParents().map(node => node.__type)


                    if (node.__type !== "text") {

                        return
                    }
                    else if (node.__type === "text" && parentsType.includes("link")) {


                    }
                    else {
                        editor.update(function () {


                            if (selection.anchor.key !== node.__key && selection.focus.key !== node.__key) {

                                const linkNode = new LinkNode(address)

                                const textNode = new TextNode(node.getTextContent())

                                textNode.__style = node.__style
                                textNode.__format = node.__format
                                textNode.__detail = node.__detail
                                textNode.__mode = node.__mode
                                node.replace(linkNode.append(textNode), false)
                            }
                            else if (selection.anchor.key === node.__key && selection.focus.key === node.__key) {


                                const selectedText = selection.getTextContent()
                                const [startPos, endPos] = selection.getCharacterOffsets().sort((a, b) => a - b)

                                //const splitedNodes = node.splitText(startPos, endPos).map(item => item.toggleUnmergeable())
                                const splitedNodes = node.splitText(startPos, endPos)

                                splitedNodes.forEach(item => {

                                    if (item.getTextContent() === selectedText) {
                                        const linkNode = new LinkNode(address)
                                        const textNode = new TextNode(item.getTextContent())
                                        textNode.__style = item.__style
                                        textNode.__format = item.__format
                                        textNode.__detail = item.__detail
                                        textNode.__mode = item.__mode

                                        item.replace(linkNode.append(textNode), false)
                                    }
                                })
                            }
                            else if (selection.anchor.key === node.__key && selection.focus.key !== node.__key) {

                                const anchorOffSet = selection.anchor.offset
                                //const splitedNodes = node.splitText(anchorOffSet).map(item => item.toggleUnmergeable())
                                const splitedNodes = node.splitText(anchorOffSet)
                                const item = selection.isBackward() ? splitedNodes.shift() : splitedNodes.pop()

                                const linkNode = new LinkNode(address)
                                const textNode = new TextNode(item.getTextContent())
                                textNode.__style = item.__style
                                textNode.__format = item.__format
                                textNode.__detail = item.__detail
                                textNode.__mode = item.__mode
                                item.replace(linkNode.append(textNode), false)

                            }
                            else if (selection.anchor.key !== node.__key && selection.focus.key === node.__key) {
                                const focusOffSet = selection.focus.offset
                                //const splitedNodes = node.splitText(focusOffSet).map(item => item.toggleUnmergeable())
                                const splitedNodes = node.splitText(focusOffSet)
                                const item = !selection.isBackward() ? splitedNodes.shift() : splitedNodes.pop()

                                const linkNode = new LinkNode(address)
                                const textNode = new TextNode(item.getTextContent())
                                textNode.__style = item.__style
                                textNode.__format = item.__format
                                textNode.__detail = item.__detail
                                textNode.__mode = item.__mode
                                item.replace(linkNode.append(textNode), false)

                            }






                        })
                    }

                })

            
                const newSelection = $createRangeSelection();
                newSelection.anchor.set(selection.focus.key, selection.focus.offset, "text")
                newSelection.focus.set(selection.focus.key, selection.focus.offset, "text")
                newSelection.format = selection.format
                $setSelection(newSelection)



            },
            COMMAND_PRIORITY_NORMAL
        )
        const remove2 = editor.registerCommand(
            REMOVE_LINK_COMMAND,
            function () {
                const selection = $getSelection()
                if (!$isRangeSelection(selection) || selection.isCollapsed()) {
                    console.log("not good selection")
                    return
                }


                const selectecdNodes = selection.getNodes()

                console.log(selectecdNodes)

                if (selectecdNodes.findIndex(node => node.__type === "link") == -1) {
                 
                    let shouldEnd = true
                    let parentNode
                    selectecdNodes.forEach(item => {
                        if (item.getParent().__type === "link") {
                            shouldEnd = false
                            parentNode = item.getParent()
                        }
                    })

                    if (shouldEnd) { return }
                    else {
                        const textNodes = parentNode.getChildren()
                        textNodes.forEach((node) => {

                            const linkNode = new LinkNode(parentNode.__url)
                          

                            if (!node.isSelected()) {

                                parentNode.insertBefore(linkNode.append(node))

                            }
                            else if (node.__key !== selection.anchor.key && node.__key !== selection.focus.key) {
                              
                                parentNode.insertBefore(node)
                            }
                            else if (node.__key === selection.anchor.key && node.__key === selection.focus.key) {


                              //  console.log(3333)
                                const arrayPos = selection.getCharacterOffsets()
                                const [pos1, pos2] = arrayPos.sort(function (a, b) { return a - b })


                              //  const [part1, part2, part3] = node.splitText(pos1, pos2).map(n => n.toggleUnmergeable())
                                const [part1, part2, part3] = node.splitText(pos1, pos2)
                              //  console.log(part1, part2, part3)

                                if ((part1) && (part2) && (part3)) {
                                    part1 && parentNode.insertBefore(new LinkNode(parentNode.__url).append(part1))
                                    part2 && parentNode.insertBefore(part2)
                                    part3 && parentNode.insertBefore(new LinkNode(parentNode.__url).append(part3))

                                }
                                else if ((part1) && (!part2) && (!part3)) {
                                    part1 && parentNode.insertBefore(part1)

                                }
                                else if ((part1) && (part2) && (!part3)) {
                                   // console.log(pos1, pos2)
                                    part1 && parentNode.insertBefore(pos1 == 0 ? part1 : new LinkNode(parentNode.__url).append(part1))
                                    part2 && parentNode.insertBefore(pos1 == 0 ? new LinkNode(parentNode.__url).append(part2) : part2)

                                }




                            }
                            else if (!selection.isBackward() && node.__key === selection.anchor.key && node.__key !== selection.focus.key) {
                                const [part1, part2] = node.splitText(selection.anchor.offset)
                               // console.log(4444)
                               // console.log(part1, part2)
                                if (part1 && part2) {
                                    part1 && parentNode.insertBefore(linkNode.append(part1))
                                    part2 && parentNode.insertBefore(part2)

                                }
                                if (part1 && !part2) {
                                    part1 && parentNode.insertBefore(part1)
                                    // part2 && parentNode.insertBefore(part2)

                                }

                            }
                            else if (!selection.isBackward() && node.__key !== selection.anchor.key && node.__key === selection.focus.key) {
                                const [part1, part2] = node.splitText(selection.focus.offset)

                               // console.log(5555)
                                part1 && parentNode.insertBefore(part1)
                                part2 && parentNode.insertBefore(linkNode.append(part2))

                            }
                            else if (selection.isBackward() && node.__key === selection.anchor.key && node.__key !== selection.focus.key) {
                                const [part1, part2] = node.splitText(selection.anchor.offset)

                                //console.log(6666)
                               
                                    part1 && parentNode.insertBefore(part1)
                                    part2 && parentNode.insertBefore(linkNode.append(part2))
                              
                          

                            }
                            else if (selection.isBackward() && node.__key !== selection.anchor.key && node.__key === selection.focus.key) {
                                const [part1, part2] = node.splitText(selection.focus.offset)

                                //console.log(7777, part1, part2)
                                if (part1 && part2) {
                                    part1 && parentNode.insertBefore(linkNode.append(part1))
                                    part2 && parentNode.insertBefore(part2)
                                }
                                if (part1 && !part2) {
                                    part1 && parentNode.insertBefore(part1)
                                }
                            }



                        })


                    }
                    parentNode.remove()
                }
                else {
                    selectecdNodes.forEach(node => {


                        if (node.__type === "link") {
                            node.getChildren().forEach((item) => {
                                //  node.insertBefore(item, true)



                                if (!item.isSelected()) {
                                 
                                    const linkNode = new LinkNode(node.__url)
                                    node.insertBefore(linkNode.append(item))
                                }
                                else if (item.isSelected()) {
                                    if (item.__key !== selection.anchor.key && item.__key !== selection.focus.key) {
                                        console.log("11111")
                                        node.insertBefore(item)
                                    }
                                    else if (item.__key === selection.anchor.key && item.__key === selection.focus.key) {
                                        console.log("22222")

                                    }
                                    else if (!selection.isBackward() && item.__key === selection.anchor.key && item.__key !== selection.focus.key) {
                                        console.log("3333")
                                        const linkNode = new LinkNode(node.__url)

                                        // console.log(item.splitText(selection.anchor.offset).map(n=>n.toggleUnmergeable()))
                                        const [part1, part2] = item.splitText(selection.anchor.offset)
                                        part1 && node.insertBefore(linkNode.append(part1))
                                        part2 && node.insertBefore(part2)
                                    }
                                    else if (!selection.isBackward() && item.__key === selection.focus.key && item.__key !== selection.anchor.key) {
                                       
                                        console.log("4444")
                                        const linkNode = new LinkNode(node.__url)

                                        const [part1, part2] = item.splitText(selection.focus.offset)
                                        part1 && node.insertBefore(part1)
                                        part2 && node.insertBefore(linkNode.append(part2))

                                    }
                                    else if (selection.isBackward() && item.__key === selection.anchor.key && item.__key !== selection.focus.key) {
                                        console.log("5555")
                                        const linkNode = new LinkNode(node.__url)

                                        // console.log(item.splitText(selection.anchor.offset).map(n=>n.toggleUnmergeable()))
                                        const [part1, part2] = item.splitText(selection.anchor.offset)
                                        part1 && node.insertBefore(part1)
                                        part2 && node.insertBefore(linkNode.append(part2))
                                    }
                                    else if (selection.isBackward() && item.__key === selection.focus.key && item.__key !== selection.anchor.key) {
                                        console.log("6666")

                                        console.log(node)

                                        const linkNode = new LinkNode(node.__url)
                                        

                                        const [part1, part2] = item.splitText(selection.focus.offset)
                                        part1 && node.insertBefore(linkNode.append(part1))
                                        part2 && node.insertBefore(part2)

                                    }






                                }

                            })

                            if (node.getChildrenSize() === 0) {
                                node.remove()
                            }
                        }


                      

                    })
                }




            },
            COMMAND_PRIORITY_NORMAL

        )



        return function () {
            remove1()
            remove2()
        }

    }, [editor])


    return (
        <>
            {/* <button onClick={function (e) {

                editor.dispatchCommand(REMOVE_LINK_COMMAND, "abcdefght")

            }}>RemoveLink</button> */}

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
                editor.dispatchCommand(INSERT_LINK_COMMAND, url)
            }}>Link</button>
            <button onClick={function (e) {
                e.stopPropagation()
                editor.dispatchCommand(REMOVE_LINK_COMMAND, "abcdefght")
            }}>Remove</button>

        </>
    )

}