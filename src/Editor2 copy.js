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


import TreeViewPlugin from "./TreeViewPlugin";

import { BeautifulMentionsPlugin, BeautifulMentionNode } from "lexical-beautiful-mentions";


import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';





export class BannerNode extends ElementNode {


  static clone(node) {
    return new BannerNode(node.__key);
  }

  static getType() {
    return "banner";
  }

  /**
      * Returning false tells Lexical that this node does not need its
      * DOM element replacing with a new copy from createDOM.
      */
  updateDOM(_prevNode, _dom, _config) {
    return false;
  }


  createDOM(config, editor) {
    const element = document.createElement("div")
    //element.className = config.theme.paragraph
    addClassNamesToElement(element, config.theme.bannerGraph)
    // element.style = "background: skyblue"
    return element;
  }

  static importJSON(...args) {
    return super.importJSON(...args)
  }



  exportJSON() {


    // console.log("====",{...super.exportJSON()})
    return {
      ...super.exportJSON(),
      type: "banner",
      //    version: 1,
      //   children: [],
      customValue: "anything you like",
      //   format: "",
      //  indent: 1,
      //  direction: null,

    };
  }


  /**
   * Node should be set to paragraph when user delete all content
   */
  collapseAtStart(rangeSelection) {
    const paragraph = $createParagraphNode();
    const children = this.getChildren();
    children.forEach((child) => paragraph.append(child));
    this.replace(paragraph);

    return true;
  }

  /**
   * Node should be set to paragraph when user press Enter.
   * Node will remain the same on Shift+Enter
   */
  insertNewAfter(rangeSelection, shouldRestoreSelection) {
    console.log(shouldRestoreSelection)
    const paragraph = $createParagraphNode();
    const direction = this.getDirection();
    paragraph.setDirection(direction);
    this.insertAfter(paragraph, shouldRestoreSelection);

    return paragraph;
  }




}
export const $createBannerNode = () => {

  return new BannerNode()

}

export const INSERT_BANNER_COMMAND = createCommand("INSERT_BANNER_COMMAND")
export function BannerPlugin() {

  const [editor] = useLexicalComposerContext()


  useEffect(() => {


    return editor.registerUpdateListener((listener) => {

      // console.log('DATA', listener.editorState.toJSON())
      // console.log(editor.getEditorState().read(() => $getRoot().getChildrenKeys()));

    });


  }, [editor])

  if (!editor.hasNode(BannerNode)) { throw new Error('BannerPlugin: "BannerNode" not registered on editor'); }

  editor.registerCommand(
    INSERT_BANNER_COMMAND,
    () => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, $createBannerNode);
      }
      return true;
    },
    COMMAND_PRIORITY_NORMAL,
  );


  return (
    <button onClick={() => { editor.dispatchCommand(INSERT_BANNER_COMMAND, undefined) }}>Banner</button>
  )

}









const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;


const MATCHERS = [
  (text) => {
    const match = URL_MATCHER.exec(text);
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: match[0]
      }
    );
  },
  (text) => {
    const match = EMAIL_MATCHER.exec(text);
    return (
      match && {
        index: match.index,
        length: match[0].length,
        text: match[0],
        url: `mailto:${match[0]}`
      }
    );
  }

];

const mentionItems = {
  // "@": ["Anton", "Boris", "Catherine", "Dmitri", "Elena", "Felix", "Gina"],
  // "#": ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"],
  // "due:": ["Today", "Tomorrow", "01-01-2023"],
  "@": [
    { value: "Anton", id: "1", email: "catherine.a@example.com" },
    { value: "Boris", id: "2", email: "22222.b@example.com" },
    { value: "Cath", id: "3", email: "cat333herine.a@example.com" },
    { value: "Dyne", id: "4", email: "444erine.b@example.com" },
    // ...
  ],
  "#": [
    { value: "Anton", id: "1", email: "catherine.a@example.com" },
    { value: "Boris", id: "2", email: "22222.b@example.com" },
    { value: "Cath", id: "3", email: "cat333herine.a@example.com" },
    { value: "Dyne", id: "4", email: "444erine.b@example.com" },
    // ...
  ],

};


const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url) {
  return url === 'https://' || urlRegExp.test(url);
}


export function Editor2() {

  const initialConfig = {
    namespace: 'MyEditor',
    onError: (err) => console.error(err),
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, ParagraphNode, AutoLinkNode, BeautifulMentionNode, BannerNode],
    theme: {
      text: {
        bold: "text-bold",
        italic: "text-italic",
        underline: "text-underline",
        code: 'text-code',
        highlight: 'text-highlight',
        strikethrough: 'text-strikethrough',
        subscript: 'text-subscript',
        superscript: 'text-superscript',
      },
      bannerGraph: "bannerGraph",
      paragraph: "margin0",
      heading: {
        h1: 'margin0',
        h2: 'margin0',
        h3: 'margin0',
        h4: 'margin0',
        h5: 'margin0',
        h6: 'margin0',
      },
      list: {
        nested: {
          listitem: 'editor-nested-listitem',
        },
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listItem',
        listitemChecked: 'editor-listItemChecked',
        listitemUnchecked: 'editor-listItemUnchecked',
      },
      beautifulMentions: {
        "@": "mentionTheme",
        "@Focused": "mention",
        "#": "mention3"
      },

    }




  }

  return (
    <>

      <div style={{ width: "600px", backgroundColor: "pink", marginLeft: "50px" }}>
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={<ContentEditable
              style={{ backgroundColor: "wheat", borderRadius: "1px", borderStyle: "solid", borderWidth: "1px" }} />
            }
            placeholder={<div>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <LinkPlugin validateUrl={validateUrl} />
          <ListPlugin />
          <AutoLinkPlugin matchers={MATCHERS} />

          <BeautifulMentionsPlugin menuComponent={CustomMenu} menuItemComponent={CustomMenuItem} triggers={["@", "#"]}
            //items={mentionItems}
            onSearch={function (tag) {

              return Promise.resolve(tag === "@" ? ["aaa", "bbb", "ccc"] : ["eee", "fff", "ggg"])
            }}

          />

          <OnChangePlugin onChange={function (editorState, editor) {




            const keys = editor.getEditorState().read(

              () => {
                // console.log($getSelection().anchor, $getSelection().focus)

                // //  console.log($isRootNode($getSelection().anchor))
                // console.log($getSelection().anchor.getNode().getParents())
                // console.log($getSelection().focus.getNode().getParents())

                // console.log("isCollapsed", $getSelection().isCollapsed())
                // console.log("israngeselection", $isRangeSelection($getSelection()))


                // const keys = $getRoot().getChildrenKeys()
                // return keys
              }

            );

            // editor.update(() => {
            //     const editorState = editor.getEditorState();
            //     const jsonString = JSON.stringify(editorState);
            //     //  console.log('jsonString', editor.getEditorState());

            //     const htmlString = $generateHtmlFromNodes(editor, null);
            //     //console.log('htmlString', htmlString);
            //     setHtml(htmlString)
            // });
          }} />
          <ToolPlugins />
          <BannerPlugin />

          <ToolBarPlugin />


          <br /><div><b>Tree</b></div>
          <TreeViewPlugin />

          {/* <LexicalClickableLinkPlugin /> */}
          {/* <CustomDraggableBlockPlugin /> */}


        </LexicalComposer>
        {/* {parse(html)} */}

      </div>
    </>
  )
}

function ToolBarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [show, setShow] = useState(false)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const toolRef = useRef()


  useEffect(() => {
    // return editor.registerMutationListener(TextNode, (mutations) => {
    //   const registeredElements = new WeakSet();
    //   editor.getEditorState().read(() => {
    //     for (const [key, mutation] of mutations) {
    //       const element = editor.getElementByKey(key);
    //       if (
    //         // Updated might be a move, so that might mean a new DOM element
    //         // is created. In this case, we need to add and event listener too.
    //         (mutation === 'created' || mutation === 'updated') &&
    //         element !== null &&
    //         !registeredElements.has(element)
    //       ) {
    //         registeredElements.add(element);
    //         element.addEventListener('click', (event) => {
    //         //  alert('Nice!');
    //         console.log(element)
    //         });
    //       }
    //     }
    //   });
    // });


    return editor.registerUpdateListener(listener => {

      editor.getEditorState().read(() => {

        //  setShow(!$getSelection().isCollapsed())
        const selection = $getSelection()
        setShow(!selection?.isCollapsed())

        if ($isRangeSelection(selection) && !selection.isCollapsed()) {


          // const offSet = selection.isBackward
          //   ? editor.getElementByKey(selection.anchor.getNode().__key)
          //   : editor.getElementByKey(selection.focus.getNode().__key)

          // //console.log( selection.anchor.getNode().exportDOM(editor))
          const element = selection.isBackward
            ? editor.getElementByKey(selection.anchor.getNode().__key)
            : editor.getElementByKey(selection.anchor.getNode().__key)

          //  console.log(element)

          //  const {x,y} = element.getBoundingClientRect()

          //   setX(x);setY(y);setMoveRight(moveRight)

          //   window.getSelection().getRangeAt(0)
          console.log("startOffset",window.getSelection().getRangeAt(0).startOffset)
          console.log(window.getSelection().getRangeAt(0).getBoundingClientRect())
          console.log("focusOffset",window.getSelection().focusOffset)
          setX(window.getSelection().getRangeAt(0).getBoundingClientRect().x)
          setY(window.getSelection().getRangeAt(0).getBoundingClientRect().y)
          computePosition(window.getSelection().getRangeAt(0), toolRef.current, { placement: 'top', middleware: [flip(), shift()], })
            .then(pos => {
              //  setCoords({ x: pos.x, y: pos.y - 10 });
              //  setX(pos.x)
              //  setY(pos.y)
              //  console.log(pos)
            })


        }


      })

    })

  }, [editor])


  return (

    //show && <div style={{ backgroundColor: "lightgray", position: "fixed", left: x, top: y, transform: `translateX(50%) translateY(-100%)` }}>ToolBar</div>
    <div style={{
      backgroundColor: "lightgray", position: "absolute", left: x, top: y, display: show ? "block" : "none", transform: `translateX(0%) translateY(-100%)`
    }}
      ref={toolRef}>ToolBarToolBarToolBarToolBar</div>
  )

}



export const FORMAT_HEADING_COMMAND = createCommand("FORMAT_HEADING_COMMAND");
export function ToolPlugins() {
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


  return (
    <>


      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>Undo</button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>Redo</button>
      <br />

      <div><b>Text actions</b></div>
      {['Bold',
        'Italic',
        'Underline',
        'Code',
        'Highlight',
        'Strikethrough',
        'Subscript',
        'Superscript'].map((value, index) => <button key={index} onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, value.toLowerCase()) }}>{value}</button>)
      }
      <br />

      <div><b>Align actions</b></div>
      {['Left',
        'Center',
        'Right',
        'Justify',
      ].map((value, index) => <button key={index} onClick={() => { editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, value.toLowerCase()) }} >{value}</button>)
      }
      <br />

      <button onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}>Outdent</button>
      <button onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}>Indent</button>
      <br />

      {["H1", "H2", "H3", "H4", "H5", "H6"].map((value, index) => {

        return <button key={index} onClick={() => {
          editor.dispatchCommand(FORMAT_HEADING_COMMAND, value.toLowerCase(), "==" + value, "3##$#")
        }}>{value}</button>

      })}


      <br />

    </>


  )

}

const CustomMenu = forwardRef(
  function CustomMenu_({ open, loading, ...props }, ref) {
    return (

      <ul ref={ref}
        className="mention"
        {...props}

      />
    )
  }
);


const CustomMenuItem = forwardRef(
  function CustomMenuItem_({ selected, item = "", ...props }, ref) {

    return (
      <li ref={ref}
        className={`${selected ? "mention2" : "mention3"}`}
        {...props}

      />
    )
  }
);

