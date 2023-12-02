import {
    ParagraphNode, ElementNode, createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode,
    TextNode, $getNodeByKey, $getSelection, $isRangeSelection,
    $setSelection, $createRangeSelection
} from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"
import { $setBlocksType, $patchStyleText, $isAtNodeEnd } from '@lexical/selection'
import parse from 'html-react-parser';


export class SepNode extends DecoratorNode {

    constructor(key) {
        super(key)

    }
    static importJSON(...args) {
        return new SepNode()
    }

    exportJSON() {
        return {
            //...super.exportJSON(),
            type: "SepNode"

        };
    }

    exportDOM(...args) {
        return ""
    }

    static getType() {
        return "SepNode";
    }

    updateDOM() {
        return true
    }
    isInline() {
        return true
    }
    isIsolated() {
        return true
    }

    static clone(node) {
        return new SepNode(node.__key);
    }

    createDOM(config) {
        // const dom = super.createDOM(config);
        //dom.style = "background: lightgreen";
        //return dom

        // const element = super.createDOM(config)
        const element = document.createElement("span")
        // element.style.borderWidth="4px"
        // element.style.borderColor="gray"
        // element.style.borderStyle="solid"
        // element.className = config.theme.banner || ""
        // element.style.backgroundColor = "lightgreen"
        // // element.appendChild(document.createElement("hr"))
        return element;
    }
    decorate(...args) {
        //  console.log(args)
        // return ""
        return <ReactSepNode {...args} node={this} />

    }
}

function ReactSepNode() {
    return (
        <span style={{ borderWidth: "0px", borderLeftWidth: "px", borderStyle: "solid", borderColor: "gray" }} />
    )
}

export const INSERT_SEP_COMMAN = createCommand("insertSepNode")
export function SepNodePlugin({ node, ...props }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        const remove1 = editor.registerCommand(
            INSERT_SEP_COMMAN,
            function () {
                const sepNode = new SepNode()


                $insertNodes([sepNode], false);
            },
            COMMAND_PRIORITY_NORMAL
        )

        const remove2 = editor.registerMutationListener(SepNode, function (mutatedNodes) {


            for (let [nodeKey, mutation] of mutatedNodes) {
                //  console.log(nodeKey, mutation)
                editor.update(function () {

                    const sepNode = $getNodeByKey(nodeKey)
                    if (sepNode?.getPreviousSibling()?.getType() === "SepNode") {
                        sepNode?.getPreviousSibling()?.remove()
                    }






                })


            }
        })

        // const remove3 = editor.registerMutationListener(TextNode, function (mutatedNodes) {


        //     for (let [nodeKey, mutation] of mutatedNodes) {
        //         editor.update(function () {
        //             const textNode = $getNodeByKey(nodeKey)
         
        //             if (textNode?.getFormat() !== 0) {
        //                 console.log(textNode,textNode?.getTextContent(),textNode?.getFormat())
        //                 // const tn = new TextNode("fe")

        //                 // console.log(textNode.getTextContent())
        //                  const textNode2 = new TextNode2(textNode?.getTextContent()||"qdwq", "blue")

        //                  textNode2.setFormat(textNode?.getFormat()||128)

                      

        //                 console.log(textNode2.getType())

        //                textNode.replace(textNode2,false)
        //               //   textNode.replace(new TextNode("&&&&&"), false)
        //             }

        //         })
        //     }


        // })


        // const remove3 = editor.registerUpdateListener(() => {

        //     editor.update(() => {
        //         const selection = $getSelection()
        //         if (selection && $isRangeSelection(selection) && selection.isCollapsed() && $isAtNodeEnd(selection.focus) && (selection.focus.offset !== 0)) {

        //             if ($getNodeByKey(selection.focus.key).getType() === "text") {
        //                 const node = $getNodeByKey(selection.focus.key).getNextSibling()
        //                 if (node && node.getType() === "text") {

        //                     console.log(node.__key)
        //                     const newSelection = $createRangeSelection();
        //                     newSelection.anchor.set(node.__key, 1, "text")
        //                     newSelection.focus.set(node.__key, 1, "text")
        //                     newSelection.format = selection.format
        //                  //   $setSelection(newSelection)

        //                 }

        //             }

        //         }
        //     })


        //     //   if(selection.get)

        // })


        // const remove3 = editor.registerMutationListener(TextNode, function (mutatedNodes) {


        //     for (let [nodeKey, mutation] of mutatedNodes) {
        //         //console.log(nodeKey, mutation)
        //         editor.update(function () {

        //             const textNode = $getNodeByKey(nodeKey)

        //     //        const aaa = new TextNode("Few")


        //             //  console.log(textNode?.getFormat())
        //             if (textNode?.getPreviousSibling()?.getType() === "text") {

        //                 if (textNode.getPreviousSibling().getFormat() !== textNode.getFormat()) {
        //                     textNode.insertBefore(new SepNode())
        //                 }




        //             }
        //             if (textNode?.getNextSibling()?.getType() === "text") {

        //                 if (textNode.getNextSibling().getFormat() !== textNode.getFormat()) {
        //                     textNode.insertAfter(new SepNode())
        //                 }


        //             }
        //             if (!textNode?.getPreviousSibling()) {
        //                 textNode?.getFormat() && textNode.insertBefore(new SepNode())
        //             }
        //             if (!textNode?.getNextSibling()) {
        //                 textNode?.getFormat() && textNode.insertAfter(new SepNode())
        //             }


        //         })


        //     }
        // })

        // const remvoe4 = editor.registerMutationListener(TextNode, function (mutatedNodes) {

        //     for (let [nodeKey, mutation] of mutatedNodes) {
        //         console.log("444444")
        //         editor.update(function () {

        //             const midText = $getNodeByKey(nodeKey)

        //             const leftSep = midText?.getPreviousSibling()
        //             const leftText = leftSep?.getPreviousSibling()


        //             const rightSep = midText?.getNextSibling()
        //             const rightText = leftSep?.getPreviousSibling()

        //             if ((leftSep && leftSep?.getType() === "SepNode") && (leftText?.getType() === "text")) {

        //                 if (midText.getFormat() === leftText.getFormat()) {
        //                     console.log("left", midText.getFormat(), leftText.getFormat())

        //                     editor.update(() => {
        //                         leftSep.remove()
        //                     })

        //                 }

        //             }

        //             if ((rightSep && rightSep?.getType() === "SepNode") && (rightText?.getType() === "text")) {

        //                 if (midText.getFormat() === rightText.getFormat()) {
        //                     console.log("right", midText.getFormat(), rightText.getFormat())
        //                     editor.update(() => {
        //                         rightSep.remove()
        //                     })

        //                 }

        //             }


        //             // if ((left?.getType() === "text") && (right?.getType() === "text")) {

        //             //     console.log(left.getFormat(), right.getFormat())
        //             //     if (left.getFormat() === right.getFormat()) {
        //             //         sepNode.remove()
        //             //     }
        //             // }


        //         })
        //     }

        // })





        // const remove3 = editor.registerNodeTransform(SepNode, function (mutatedNodes) {
        //     for (let [nodeKey, mutation] of mutatedNodes) {
        //         console.log(nodeKey, mutation)
        //         editor.update(function () {
        //             console.log(nodeKey)
        //             const sepNode = $getNodeByKey(nodeKey)
        //             if (sepNode?.getPreviousSibling()?.getType() === "SepNode") {
        //                 sepNode?.getPreviousSibling()?.remove()
        //             }

        //         })


        //     }
        // })





        return function () {
            remove1()
            remove2()
           // remove3()
            //  remvoe4()
        }



    }, [editor])

    return (
        <></>
        // <button onClick={function () {
        //     editor.dispatchCommand(INSERT_SEP_COMMAN, null)

        // }}>SepNode</button>
    )

}



export class TextNode2 extends TextNode {
    __color;

    constructor(text, color, key) {
        super(text, key);
        this.__color = color;
    }


    getFormat(){
        return this.__format
    }

    replace(...args){
        return super.replace(...args)
    }

    static getType() {
        return 'text2';
    }

    static clone(node) {
        return new TextNode2(node.__text, node.__color, node.__key);
    }

    createDOM(config) {
        const element = super.createDOM(config);
        element.style.color = this.__color;
        return element;
    }

    updateDOM(
        prevNode,
        dom,
        config,
    ) {

        const isUpdated = super.updateDOM(prevNode, dom, config);
        if (prevNode.__color !== this.__color) {
            dom.style.color = this.__color;
        }
        return isUpdated;

    }

    canInsertTextBefore() {

        return false

        this.setFormat(0)
        this.toggleUnmergeable()
        this.toggleFormat()
        console.log(!Boolean(this.getFormat()))
        return !Boolean(this.getFormat())

    }

    canInsertTextAfter() {

        return false
        //   this.setFormat(0)

        console.log(!Boolean(this.getFormat()))
        return !Boolean(this.getFormat())
    }
}