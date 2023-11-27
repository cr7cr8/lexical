import { ParagraphNode, ElementNode, createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode, TextNode, } from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"



export class MentionNode extends DecoratorNode {

    constructor(name,value,key) {
        super(key)
        
        this.nodeName = name
        this.nodeValue = value
     
    }
    static importJSON(...args) {
        return super.importJSON(...args)
    }

    exportJSON() {
        return {
            ...super.exportJSON(),

        };
    }
    setNodeValue(value) {
        const self = this.getWritable();
        self.nodeValue = value;
    }
    getNodeValue() {
        return this.nodeValue
    }

    exportDOM(...args) {
        // console.log(super.exportDOM(...args).elem)
        // return  super.exportDOM(...args)
        // return document.createElement("span").append("abcd")

        return {
            element: super.exportDOM(...args).element,
            after: function (generatedElement) {

                // console.log("---", generatedElement)
                // return generatedElement.append("aaa")
                //  return ReactNode
                const el = document.createElement("span")
                el.setAttribute("data-increment", this.nodeValue)
                el.setAttribute("data-name", this.nodeName)
                el.setAttribute("data-type", this.getType())
                // el.append("this is a react node")
                generatedElement.appendChild(el)
                // console.log(generatedElement)

                return generatedElement



            }

        }

    }
    static getType() {
        return "MentionNode";
    }

    static clone(node) {
        return new MentionNode(node.nodeName,node.nodeValue,node.__key);
    }
    isInline() {
        return true
    }
    isIsolated() {
        return true
    }

    updateDOM() {
        return false
    }

    insertNewAfter(_selection, restoreSelection) {
        alert("xxx")
        const newBlock = $createParagraphNode();
        const direction = this.getDirection();
        newBlock.setDirection(direction);
        this.insertAfter(newBlock, restoreSelection);
        return newBlock;
    }

    collapseAtStart(selection) {
        const paragraph = $createParagraphNode()
        const children = this.getChildren()
        children.forEach(child => paragraph.append(child))
        this.replace(paragraph)
        return true
    }

    createDOM(config) {

        const element = document.createElement("span")

        element.className = config.theme.banner || ""
        element.style.backgroundColor = "lightgreen"
        // element.appendChild(document.createElement("hr"))
        return element;

    }


    decorate(...args) {
        //  console.log(args)
        return <ReactNode {...args} node={this} />
        //return <MyComponent {...args} node={this} />
    }



}



function ReactNode(props) {


   // const [state, setState] = useState(1)
    const [editor] = useLexicalComposerContext()







    return <button style={{ backgroundColor: "orange", borderWidth: 0,userSelect:"none" }}
        // onKeyDown={function () {
        //     setState(pre => pre + 1)

        //     editor.update(() => {

        //         props.node.setNodeValue(state + 1)
        //     })
        // }}
        onClick={function () {
    
          //  setState(pre => pre + 1)

            editor.update(() => {

                props.node.setNodeValue(props.node.getNodeValue() + 1)
                
            })

            // editor.getEditorState().read(() => { })
            // alert($generateHtmlFromNodes(editor, null))
        }}
        // onChange={function (e) {
        //     setText(e.target.value)
        // }}

    >{props.node.nodeName} {props.node.getNodeValue()}</button>
}
