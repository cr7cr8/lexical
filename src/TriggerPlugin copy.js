import './App.css';
import {
    ParagraphNode, ElementNode,
    createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode,
    TextNode, $getNodeByKey, $getSelection, $isRangeSelection, $setSelection, RangeSelection, $createRangeSelection,
    BLUR_COMMAND, FOCUS_COMMAND, COMMAND_PRIORITY_LOW,KEY_ENTER_COMMAND,KEY_ARROW_UP_COMMAND,KEY_ARROW_DOWN_COMMAND

} from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef, useState, useLayoutEffect } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"
import { HeadingNode, $createHeadingNode } from '@lexical/rich-text'

import { SepNode, INSERT_SEP_COMMAN, SepNodePlugin } from "./SepNode"

import { $setBlocksType, $patchStyleText, $cloneWithProperties, $sliceSelectedTextNodeContent, $wrapNodes, $addNodeStyle } from '@lexical/selection'


export function TriggerPlugin() {
    const [editor] = useLexicalComposerContext()
    const [show, setShow] = useState(false)
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const ref = useRef()

    const [tabNum, setTabNum] = useState(30000)

 
    
         useLayoutEffect(() => {
        // const onKeyDown = (e) => { /* Your handler logic here */
        // console.log(e.key)
        //     if (show && e.key === "ArrowDown" ) {
        //         e.preventDefault()
        //         //   setTimeout(() => {
        //         //ref.current.focus()
        //         //   }, 100);
        //         setTabNum(num=>num+1)
        //     }

        //     else if (show &&  e.key === "ArrowUp") {
        //         e.preventDefault()
        //         //   setTimeout(() => {
        //         //ref.current.focus()
        //         //   }, 100);
        //         setTabNum(num=>num-1)
        //     }
        //     else if (show  ){
        //         e.preventDefault()
        //         e.stopPropagation()
        //         console.log(e.key)
        //     }

        // };

        // return editor.registerRootListener((rootElement, prevRootElement,) => {

        //     if (prevRootElement !== null) {
        //         prevRootElement.removeEventListener('keydown', onKeyDown);
        //     }
        //     if (rootElement !== null) {
        //         rootElement.addEventListener('keydown', onKeyDown);
        //     }
        // });

        const remove1 = editor.registerCommand(KEY_ARROW_UP_COMMAND,(e)=>{

           show&& e.preventDefault()
           show&& setTabNum(num=>num-1)
          
        },COMMAND_PRIORITY_NORMAL)

        
        const remove2 = editor.registerCommand(KEY_ARROW_DOWN_COMMAND,(e)=>{

            show&&e.preventDefault()
            show&&setTabNum(num=>num+1)
          
        },COMMAND_PRIORITY_NORMAL)

        const remove3 = editor.registerCommand(KEY_ENTER_COMMAND,(e)=>{
            if(show){
              e.preventDefault()
              setShow(false)
        console.log("Xxx")
            }
             
          
        },COMMAND_PRIORITY_NORMAL)


        return function(){
            remove1()
            remove2()
            remove3()
        }


    }, [editor, show]);


    useEffect(() => {

        const remove0 = editor.registerUpdateListener(({ editorState }) => {
            // Read the editorState and maybe get some value.
            editorState.read(() => {



                const selection = $getSelection()
                if (selection && $isRangeSelection(selection) && selection.isCollapsed()) {
                    //console.log(selection.focus.offset)


                    const textNode = $getNodeByKey(selection.focus.key)

                    const text = textNode.getTextContent()
                    const focusOffset = selection.focus.offset

                    const word = getWordAt(text,focusOffset-1)

                    if(word&&String(word).charAt(0)==="@"){
                        setX(window.getSelection().getRangeAt(0).getBoundingClientRect().x)
                        setY(window.getSelection().getRangeAt(0).getBoundingClientRect().y)
                        console.log(word)
                        setShow(true)
                    }
                    else{
                        setShow(false)
                    }

                }




                // ...
            });

            // Then schedule another update.
            editor.update(() => {
                // ...
            });
        });

        const remove1 = editor.registerNodeTransform(TextNode, textNode => {

            //  const selection = $getSelection()
            //    console.log(selection)

            // console.log(selection.focus.offset)

            // if (!selection.isCollapsed()) { setShow(false) ;return }

            //        const regx = /((^)|(s*))(@)([a-z]|[A-Z]|[\u4E00-\u9FFF]|){1,1}([a-z]|[A-Z]|[\u4E00-\u9FFF]|_|[0-9])*/g


            const regx = /((^)|(s*))(@)([a-z]|[A-Z]|[\u4e00-\u9fa5]){0,1}([a-z]|[A-Z]|[0-9]|[\u4e00-\u9fa5]|_)*/g

            const text = textNode.getTextContent()
            const matchResult = text.match(regx)

            //   console.log(matchResult)

            // if (text.indexOf("?") === text.length - 1) {
            // if (matchResult) {
            //     setX(window.getSelection().getRangeAt(0).getBoundingClientRect().x)
            //     setY(window.getSelection().getRangeAt(0).getBoundingClientRect().y)

            //     setShow(true)

            // }
            // else {
            //     setShow(false)
            // }

        })





        return function () {
            remove0()
            remove1()

        }

    }, [editor])

    return (
        <div className="pannel" style={{
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
            onClick={function (e) {
                console.log("click")
            }}
            ref={ref}
            tabIndex="0"
        >

            <div style={{ backgroundColor: (tabNum % 3) === 0 ? "yellow" : "transparent" }}>abc</div>
            <div style={{ backgroundColor: (tabNum % 3) === 1 ? "yellow" : "transparent" }}>defg</div>
            <div style={{ backgroundColor: (tabNum % 3) === 2 ? "yellow" : "transparent" }}>hijkl</div>
        </div>
    )

}



function getWordAt (str, pos) {
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


// function getWordAt (str, pos) {
//     // check ranges
//     if ((pos < 0) || (pos > str.length)) {
//         return '';
//     }
//     // Perform type conversions.
//     str = String(str);
//     pos = Number(pos) >>> 0;
    
//     // Search for the word's beginning and end.
//     var left = str.slice(0, pos + 1).search(/\S+$/), // use /\S+\s*$/ to return the preceding word 
//         right = str.slice(pos).search(/\s/);
    
//     // The last word in the string is a special case.
//     if (right < 0) {
//         return str.slice(left);
//     }
    
//     // Return the word, using the located bounds to extract it from the string.
//     return str.slice(left, right + pos);
    
// }