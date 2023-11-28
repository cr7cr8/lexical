import { ParagraphNode, ElementNode, createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode, TextNode, $getNodeByKey, } from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"

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
                //console.log(nodeKey, mutation)
                editor.update(function () {
                    const sepNode = $getNodeByKey(nodeKey)
                    if (sepNode?.getPreviousSibling()?.getType() === "SepNode") {
                        sepNode?.getPreviousSibling()?.remove()
                    }

                })
 

            }
        })


        return function () {
            remove1()
            remove2()
        }



    }, [editor])

    return (

        <button onClick={function () {
            editor.dispatchCommand(INSERT_SEP_COMMAN, null)

        }}>SepNode</button>
    )

}