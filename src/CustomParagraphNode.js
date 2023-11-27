import { ParagraphNode, ElementNode, createCommand, COMMAND_PRIORITY_NORMAL, $insertNodes, $createParagraphNode, DecoratorNode, TextNode, } from "lexical";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState } from "react";

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"

import parse from 'html-react-parser';

import ContentEditable from 'react-contenteditable'
//import Editor3 from './Editor3';

import React from "react"

export class CustomParagraphNode extends ParagraphNode {

  constructor(key) {
    super(key)

  }

  static importJSON(...args) {
    return super.importJSON(...args)
  }

  exportJSON() {
    return {
      ...super.exportJSON(),

    };
  }


  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key);
  }

  createDOM(config) {
    // const dom = super.createDOM(config);
    //dom.style = "background: lightgreen";
    //return dom

    const element = document.createElement("div")
    //element.className = config.theme.paragraph
    addClassNamesToElement(element, config.theme.customParagraph)
    element.style = "background: skyblue"

    return element;
  }
}


//export class BannerNode extends ElementNode {
export class BannerNode extends DecoratorNode {

  constructor(key) {
    super(key)
    this.nodeValue = 1
    this.nodeText = "ReactNode"
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

  setNodeText(value) {
    const self = this.getWritable();
    self.nodeText = value;
  }
  getNodeText() {
    return this.nodeText
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
        el.setAttribute("data-text", this.nodeText)
        el.setAttribute("data-type", this.getType())
        // el.append("this is a react node")
        generatedElement.appendChild(el)
        // console.log(generatedElement)

        return generatedElement



      }

    }

  }
  static getType() {
    return "BannerNode";
  }

  static clone(node) {
    return new BannerNode(node.__key);
  }
  isInline() {
    return true
  }
  isIsolated() {
    return false
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
    //return <ReactNode {...args} node={this} />
    return <MyComponent {...args} node={this} />
  }

}

export function $createBannerNode() {

  return new BannerNode()
}

export function $isBannerNode(node) {

  return node instanceof BannerNode
}

export const INSERT_BANNER_COMMAND = createCommand("insertBanner")

export function BannerPlugin() {
  const [editor] = useLexicalComposerContext()
  if (!editor.hasNode(BannerNode)) {
    throw new Error("Banner node is not registed in Editor")
  }

  useEffect(() => {


    const remove1 = editor.registerRootListener(
      (rootElement, prevRootElement) => {

        function showArgs(key) { console.log(key.altKey, key.shiftKey) }

        if (prevRootElement !== null) {
          prevRootElement.removeEventListener('keypress', showArgs);
        }


        if (rootElement !== null) {
          rootElement.addEventListener("keypress", showArgs)
        }
      },
    );

    const remove2 = editor.registerDecoratorListener(
      (rootElement, prevRootElement) => {
        //  console.log("you pressed",rootElement,Object.keys(rootElement))
      },
    )

    const remove3 = editor.registerCommand(
      INSERT_BANNER_COMMAND,
      () => {
        const bannerNode = $createBannerNode()
        $insertNodes([bannerNode], false);
        return true
      },
      COMMAND_PRIORITY_NORMAL
    )
    return function () { remove1(); remove2(); remove3() }

  }, [editor])

  return null
}

function ReactNode(props) {


  const [state, setState] = useState(1)
  const [editor] = useLexicalComposerContext()
  const [text, setText] = useState("React Node")






  return <button style={{ backgroundColor: "orange", borderWidth: 0 }}
    onKeyDown={function () {
      setState(pre => pre + 1)

      editor.update(() => {

        props.node.setNodeValue(state + 1)
      })
    }}



    onClick={function () {
      setState(pre => pre + 1)

      editor.update(() => {

        props.node.setNodeValue(state + 1)
      })

      // editor.getEditorState().read(() => { })
      // alert($generateHtmlFromNodes(editor, null))
    }}
    onChange={function (e) {
      setText(e.target.value)
    }}

  >{text} {state}</button>
}


export class TableNode extends ElementNode {
  //  export class TableNode extends TextNode {
  constructor(key) {
    super(key)
    this.nodeValue = 1
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
    return super.exportDOM(...args)
    // return document.createElement("span").append("abcd")

    return {
      element: super.exportDOM(...args).element,
      after: function (generatedElement) {

        // console.log("---", generatedElement)
        // return generatedElement.append("aaa")
        //  return ReactNode
        const el = document.createElement("span")
        el.setAttribute("data-increment", this.nodeValue)
        el.setAttribute("data-type", this.getType())
        // el.append("this is a react node")
        generatedElement.appendChild(el)
        // console.log(generatedElement)

        return generatedElement



      }

    }

  }
  static getType() {
    return "TableNode";
  }

  static clone(node) {
    return new TableNode(node.__key);
  }
  isInline() {
    return true
  }
  isIsolated() {
    return false
  }

  updateDOM() {
    return false
  }

  // insertNewAfter(_selection, restoreSelection) {

  //   const textNode = new TextNode("_")
  //   this.insertAfter(textNode, restoreSelection);
  //   return textNode

  // }

  collapseAtStart(selection) {
    const paragraph = $createParagraphNode()
    const children = this.getChildren()
    children.forEach(child => paragraph.append(child))
    this.replace(paragraph)
    return true
  }

  createDOM(config) {

    const element = document.createElement("span")
    // const element = document.createElement("table")
    // const tr = document.createElement("tr")
    // const td = document.createElement("td")
    // td.innerText = "tablenode"

    // const tr2 = document.createElement("tr")
    // const td2 = document.createElement("td")
    // td2.innerText = "tablenode2"

    // tr.appendChild(td)
    // tr2.appendChild(td2)
    // element.appendChild(tr)
    // element.appendChild(tr2)

    element.style = "background: lightgreen"


    return element;




  }

}
export const INSERT_TABLE_COMMAND = createCommand("insertTable")
export function TablePlugin() {
  const [editor] = useLexicalComposerContext()
  if (!editor.hasNode(TableNode)) {
    throw new Error("Table node is not registed in Editor")
  }

  useEffect(() => {
    return editor.registerCommand(

      INSERT_TABLE_COMMAND,
      () => {
        //  $insertNodes([ $createParagraphNode().append($createBannerNode()) ]);

        // const bannerNode = $createBannerNode()

        //  $insertNodes([  $createParagraphNode().append($createLinkNode("aaa").append(bannerNode))]);
        //  $insertNodes([$createParagraphNode().append(new TableNode()).append(new TextNode(""))], true);
        const tableNode = new TableNode()
        let textNode = new TextNode("ss ")
        console.log(textNode.canInsertTextAfter())

        textNode = textNode.toggleUnmergeable()

        const aaa = tableNode.append(textNode)


        $insertNodes([aaa, new TextNode(" ")], false);

        return true
      },
      COMMAND_PRIORITY_NORMAL)

  }, [editor])



  return <button onClick={function () {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, null)
  }}>Table</button>
}












class MyComponent extends React.Component {
  constructor(props) {
    super()
    this.contentEditable = React.createRef();
    // this.state = { html: "<b>Hello <i>World</i></b>" };
    this.state = { html: props.node.nodeText }
    this.node = props.node
    this.editor = props[0]


  };

  handleChange = evt => {
    this.setState({ html: evt.target.value });
    this.editor.update(()=>{
      this.node.setNodeText(evt.target.value)
    })
  

  };

  render = () => {
    return <ContentEditable
      style={{ display: "inline", padding: "4px" }}
      innerRef={this.contentEditable}
      html={this.state.html} // innerHTML of the editable div
      //html={this.value}
      disabled={false}       // use true to disable editing
      onChange={this.handleChange} // handle innerHTML change
      tagName='article' // Use a custom HTML tag (uses a div by default)
    />
  };
};



