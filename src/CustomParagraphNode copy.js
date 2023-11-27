import { ParagraphNode, ElementNode } from "lexical";

export class CustomParagraphNode extends ParagraphNode {
  static getType() {
    return "custom-paragraph";
  }

  static clone(node) {
    return new CustomParagraphNode(node.__key);
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.style = "background: lightgreen";


//    return dom;
      const aaa = document.createElement("div")//.appendChild(dom)
      console.log(aaa)
      return aaa
  }
}

