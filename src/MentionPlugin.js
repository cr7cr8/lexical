import './App.css';
import {
    ParagraphNode, ElementNode,
    createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode,
    TextNode, $getNodeByKey, $getSelection, $isRangeSelection, $setSelection, RangeSelection, $createRangeSelection,
    BLUR_COMMAND, FOCUS_COMMAND, COMMAND_PRIORITY_LOW, KEY_ENTER_COMMAND, KEY_ARROW_UP_COMMAND, KEY_ARROW_DOWN_COMMAND

} from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'

import { SepNode, INSERT_SEP_COMMAN, SepNodePlugin } from "./SepNode"

import { $setBlocksType, $patchStyleText, $cloneWithProperties, $sliceSelectedTextNodeContent, $wrapNodes, $addNodeStyle } from '@lexical/selection'
import { CustomParagraphNode, BannerNode, BannerPlugin, INSERT_BANNER_COMMAND, $createBannerNode, TableNode, TablePlugin } from './CustomParagraphNode';

import { MentionNode } from './MentionNode';

export function MentionPlugin({ getFetchUrl, organizeResturnedList }) {

    const [editor] = useLexicalComposerContext()
    if (!editor.hasNode(MentionNode)) { throw new Error('BannerPlugin: "MentionNode" not registered on editor'); }
    const [show, setShow] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const ref = useRef()

    const [tabNum, setTabNum] = useState(30000)
    const [matchUsers, setMatchUsers] = useState([])

    useEffect(() => {


        const remove1 = editor.registerCommand(KEY_ARROW_UP_COMMAND, (e) => {
            if (show) {
                e.preventDefault()
                setTabNum(num => num - 1)
                // return true
            }


        }, COMMAND_PRIORITY_NORMAL)


        const remove2 = editor.registerCommand(KEY_ARROW_DOWN_COMMAND, (e) => {

            if (show) {
                e.preventDefault()
                setTabNum(num => num + 1)
                // return true
            }



        }, COMMAND_PRIORITY_NORMAL)

        const remove3 = editor.registerCommand(KEY_ENTER_COMMAND, (e) => {
            if (show) {
                e.preventDefault()

                if (matchUsers.length === 0) { return false }
                const selection = $getSelection()
                const focusOffset = selection.focus.offset
                //console.log(selection)
                const textNode = $getNodeByKey(selection.focus.key)
                const fullText = textNode.getTextContent()

                const word = getWordAt(fullText, focusOffset - 1)


                let part1 = fullText.slice(0, focusOffset)
                let part2 = fullText.slice(focusOffset, fullText.length)
                //  console.log("part1 is:" + part1)
                if (!part1) { part1 = "" }

                if (part1.length > 0) {
                    while ((part1.length > 0) && part1.at(-1).match(/[A-Za-z0-9_\u4e00-\u9fa5@]/)) {
                        part1 = part1.slice(0, -1)
                    }
                }
                if (!part2) { part2 = "" }
                if (part2.length > 0) {
                    while ((part2.length > 0) && part2.at(0).match(/[A-Za-z0-9_\u4e00-\u9fa5@]/)) {
                        part2 = part2.substring(1)
                    }
                }

                //console.log("-->", "^" + part1 + "|" + part2 + "$")


                textNode.setTextContent(part1 + "" + part2)
                textNode.splitText(part1.length)//.map(n => n.toggleUnmergeable())
                console.log(textNode.exportJSON())

                const newSelection = $createRangeSelection();
                newSelection.anchor.set(textNode.getKey(), part1.length, "text")
                newSelection.focus.set(textNode.getKey(), part1.length, "text")
                newSelection.format = selection.format
                $setSelection(newSelection)

                const mentionNode = new MentionNode(matchUsers[tabNum % matchUsers.length], tabNum, undefined)
                newSelection.insertNodes([mentionNode])

                console.log(mentionNode.exportJSON())
                // if (!part1 && !part2) { textNode.insertBefore(new MentionNode(matchUsers[tabNum % matchUsers.length], tabNum, undefined)) }
                // else {
                //   newSelection.insertNodes([new MentionNode(matchUsers[tabNum % matchUsers.length], tabNum, undefined)])
                // }


                setShow(false)
                return true
            }


        }, COMMAND_PRIORITY_NORMAL)


        return function () {
            remove1()
            remove2()
            remove3()
        }


    }, [editor, show, tabNum]);


    useEffect(() => {

        const remove0 = editor.registerUpdateListener(({ editorState }) => {
            // Read the editorState and maybe get some value.
            editorState.read(() => {



                const selection = $getSelection()

                const node = selection && $getNodeByKey(selection.focus.key)
                if (!selection || node.getType() !== "text" || node.getParent().getType() === "link") {
                    return
                }

                if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {
                    //console.log(selection.focus.offset)


                    const textNode = $getNodeByKey(selection.focus.key)

                    const text = textNode.getTextContent()
                    const focusOffset = selection.focus.offset

                    const word = getWordAt(text, focusOffset - 1)
                   // console.log("pos word is", word)
                    if (word && String(word).charAt(0) === "@") {
                        setX(window.getSelection().getRangeAt(0).getBoundingClientRect().x)
                        setY(window.getSelection().getRangeAt(0).getBoundingClientRect().y)
                        //    console.log(word)

                        const pattern = word.slice(1)
                        const fetchUrl = getFetchUrl(pattern) || 'https://dummyjson.com/users?skip=0&limit=100'


                        makeFetchRequest(fetchUrl, function (data) {

                            const users = organizeResturnedList(data, pattern)


                            // const users = Array.from(data.users).filter(user => {
                            //     return user.username.indexOf(pattern) === 0
                            // }).map(user => user.username)
                            //    setMatchUsers(users)

                            // setMatchUsers(shuffle(users))
                            setMatchUsers(users)
                            setTabNum(users.length * 100)

                        })


                        setShow(true)
                    }
                    else {
                        setShow(false)
                    }

                }
                else {
                    setShow(false)
                }



                // ...
            });

            // Then schedule another update.
            editor.update(() => {
                // ...
            });
        });

        const remove1 = editor.registerNodeTransform(TextNode, textNode => {



            const regx = /((^)|(s*))(@)([a-z]|[A-Z]|[\u4e00-\u9fa5]){0,1}([a-z]|[A-Z]|[0-9]|[\u4e00-\u9fa5]|_)*/g

            const text = textNode.getTextContent()
            const matchResult = text.match(regx)



        })





        return function () {
            remove0()
            remove1()

        }

    }, [editor])

    return (
        <div
            className='pannel'
            style={{
                width: "fit-content", position: "absolute", left: x, top: y,
                transform: "translateY(22px)",
                display: show ? "block" : "none"
            }}
            onBlur={function () {
                setShow(false)
            }}
            onKeyDown={function (e) {
                e.preventDefault()
                console.log(e.key)
                e.key === "ArrowDown" && setTabNum((num) => {
                    console.log(num)
                    return num + 1

                })

                e.key === "ArrowUp" && setTabNum((num) => {
                    console.log(num)
                    return num - 1

                })



            }}
            // onClick={function (e) {
            //     console.log("click")
            // }}
            ref={ref}
        //tabIndex="0"
        >
            {matchUsers.map((user, index) => {

                return <div
                    key={index} style={{ backgroundColor: (tabNum % matchUsers.length) === index ? "yellow" : undefined }}
                    className='tabname'
                    onMouseOver={function (e) {
                        //   console.log(e.currentTarget.innerText)
                        //   e.currentTarget.style.backgroundColor="cornflowerblue"
                    }}
                    onMouseOut={function (e) {
                        //   e.currentTarget.style.backgroundColor="transparent"
                    }}

                    onClick={function (e) {
                        e.preventDefault()

                        editor.update(() => {

                            const selection = $getSelection()
                            const focusOffset = selection.focus.offset
                            const textNode = $getNodeByKey(selection.focus.key)
                            const fullText = textNode.getTextContent()
                            const word = getWordAt(fullText, focusOffset - 1)
                            let part1 = fullText.slice(0, focusOffset)
                            let part2 = fullText.slice(focusOffset, fullText.length)

                            if (part1.length > 0) {
                                while ((part1.length > 0) && part1.at(-1).match(/[A-Za-z0-9_\u4e00-\u9fa5@]/)) {
                                    part1 = part1.slice(0, -1)
                                }
                            }

                            if (part2.length > 0) {
                                while ((part2.length > 0) && part2.at(0).match(/[A-Za-z0-9_\u4e00-\u9fa5@]/)) {
                                    part2 = part2.substring(1)
                                }
                            }


                            textNode.setTextContent(part1 + "" + part2)
                            textNode.splitText(part1.length)//.map(n => n.toggleUnmergeable())

                            const newSelection = $createRangeSelection();
                            newSelection.anchor.set(textNode.getKey(), part1.length, "text")
                            newSelection.focus.set(textNode.getKey(), part1.length, "text")
                            newSelection.format = selection.format
                            $setSelection(newSelection)
                            newSelection.insertNodes([new MentionNode(e.currentTarget.innerText, tabNum, undefined)])
                            setShow(false)

                        }, { onUpdate: function () { } })




                    }}
                >{user}</div>
            })}
        </div>


    )
}



function getWordAt(str, pos) {
    // check ranges
    if ((pos < 0) || (pos > str.length)) {
        return '';
    }
    // Perform type conversions.
    str = String(str);
    pos = Number(pos) >>> 0;

    // Search for the word's beginning and end.
    var left = str.slice(0, pos + 1).search(/([A-Z]|[a-z]|[0-9]|_|[\u4e00-\u9fa5]|@)+$/), // use /\S+\s*$/ to return the preceding word 
        right = str.slice(pos).search(/[^[A-Za-z0-9_\u4e00-\u9fa5@]/);

    // The last word in the string is a special case.
    if (right < 0) {
        return str.slice(left);
    }

    // Return the word, using the located bounds to extract it from the string.
    return str.slice(left, right + pos);

}





let debounceTimer;
function makeFetchRequest(query, callbackFn) {
    // Clear the previous debounce timer
    clearTimeout(debounceTimer);
    // Set a new timer to execute the fetch request after a delay
    debounceTimer = setTimeout(() => {
        // Create an AbortController instance
        const controller = new AbortController();
        // Obtain a reference to the AbortSignal
        const signal = controller.signal;
        // fetch(`https://api.example.com/search?q=${query}`, { signal })
        fetch(query, { signal })
            .then(response => {
                // Handle the response
                return response.json()
                //   callbackFn(response)
            })
            .then(data => {
                callbackFn(data)
            })
            .catch(error => {
                console.log(error)
                if (error.name === 'AbortError') {
                    // Handle cancellation
                } else {
                    // Handle other errors
                }
            })
            .finally(() => {
                // Cleanup logic
            });
        // To cancel the request, call the abort() method on the controller
        // For example, if the user clears the search query
        // controller.abort();
    }, 200); // Set a delay of 300 milliseconds
}

// Example usage in an input event listener
// const searchInput = document.getElementById('search-input');
// searchInput.addEventListener('input', event => {
//   const query = event.target.value;
//   makeFetchRequest(query);
// });

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
