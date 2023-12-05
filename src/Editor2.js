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

import { ToolBarPlugin, FormatButton, AlignButton, HistoryButton, IndentButton, ListButton, TableButton } from './ToolBarPlugin';
import { LinkCommandPlugin, LinkButton } from "./LinkCommandPlugin"
import { HeadingCommandPlugin, HeadingButton } from './HeadingCommandPlugin';

import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"

import { addClassNamesToElement } from "@lexical/utils"
import { $generateHtmlFromNodes } from '@lexical/html';
import parse, { domToReact } from 'html-react-parser';


import TreeViewPlugin from "./TreeViewPlugin";

import { BeautifulMentionsPlugin, BeautifulMentionNode } from "lexical-beautiful-mentions";


import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';

import { MentionPlugin } from "./MentionPlugin"
import { MentionNode } from './MentionNode';
import { SepNode, SepNodePlugin, TextNode2 } from './SepNode';


import { BannerNode, BannerCommandPlugin, BannerButton, BannerColorButton } from './BannerCommandPlugin';

import { BannerNode1, BannerNode2, BannerNode3, BannerCommandPlugin1, BannerButton1, CellNode } from './BannerCommandPlugin1';

import { ImageNode, ImageCommandPlugin, ImageButton } from './ImageCommandPlugin';

import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";

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

  const [html, setHtml] = useState("")

  return (
    <>

      <div style={{ width: "600px", backgroundColor: "pink", marginLeft: "50px" }}>
        <LexicalComposer
          initialConfig={{
            namespace: 'MyEditor',
            onError: (err) => console.error(err),
            nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, ParagraphNode, AutoLinkNode, BeautifulMentionNode, BannerNode, MentionNode, SepNode, ImageNode,
              TableCellNode, TableNode, TableRowNode,
              BannerNode1, BannerNode2, BannerNode3,CellNode,
              //    TextNode2,

              //   {
              //     replace: TextNode,
              //     with: (node) => {
              //       console.log(node)
              //       const textNode2 = new TextNode2(node.__text)
              //       textNode2.setFormat(0)
              //       return textNode2
              //     }
              //   }


              // {
              //     replace: ParagraphNode,
              //     with: (node) => {
              //         return new BannerNode();
              //     }
              // }

            ],
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
              mantionNode: "mantionNode",
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
              table: "PlaygroundEditorTheme__table",
              tableAddColumns: "PlaygroundEditorTheme__tableAddColumns",
              tableAddRows: "PlaygroundEditorTheme__tableAddRows",
              tableCell: "PlaygroundEditorTheme__tableCell",
              tableCellActionButton: "PlaygroundEditorTheme__tableCellActionButton",
              tableCellActionButtonContainer:
                "PlaygroundEditorTheme__tableCellActionButtonContainer",
              tableCellEditing: "PlaygroundEditorTheme__tableCellEditing",
              tableCellHeader: "PlaygroundEditorTheme__tableCellHeader",
              tableCellPrimarySelected: "PlaygroundEditorTheme__tableCellPrimarySelected",
              tableCellResizer: "PlaygroundEditorTheme__tableCellResizer",
              tableCellSelected: "PlaygroundEditorTheme__tableCellSelected",
              tableCellSortedIndicator: "PlaygroundEditorTheme__tableCellSortedIndicator",
              tableResizeRuler: "PlaygroundEditorTheme__tableCellResizeRuler",
              tableSelected: "PlaygroundEditorTheme__tableSelected",
            },

            //      editorState: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"hfhgfh","type":"text","version":1}],
            //     "direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`

            //        editorState: `{"root":{"children":[{"children":[{"type":"MentionNode","nodeName":"atuny0","nodeValue":10000,"version":2.5}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`,
            //    editorState:`{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"banner","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`,
            //   editorState: `{"root":{"children":[{"children":[{"type":"MentionNode","nodeName":"atuny0","nodeValue":10000,"version":2.5}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`,
            // editorState: function (editor) {
            //   const root = $getRoot();
            //   if (root.getFirstChild() === null) {

            //     const paragraph = $createParagraphNode();
            //     paragraph.append(
            //       $createTextNode("men^^^@at&&& built with "),
            //       new MentionNode("ggude7", 23),
            //       $createTextNode("The playground is a demo environment built with hihihihihihihihi "),
            //       $createTextNode("@lexical/react").toggleFormat("code"),
            //       $createTextNode(".bus"),
            //       $createLinkNode("http://baidu.com", { target: "new", title: "hihihi", }).append(
            //         $createTextNode("abcdefhilmnorstuv"),
            //       ),
            //       $createTextNode(" Try typing in "),
            //       $createTextNode("some text").toggleFormat("bold"),
            //       $createTextNode(" with "),
            //       $createTextNode("different").toggleFormat("italic"),
            //       $createTextNode(" free the cat.").setStyle("color:red")
            //     );
            //     root.append(paragraph);

            //   }
            // }
            // editorState: `{"root":{"children":[{"children":[{"type":"SepNode"}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`,
          }}>
          <RichTextPlugin
            contentEditable={<ContentEditable
              style={{ backgroundColor: "wheat", borderRadius: "1px", borderStyle: "solid", borderWidth: "1px" }} />
            }
            placeholder={<div>Enter some text...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          {/* <LinkPlugin validateUrl={validateUrl} /> */}

          <ListPlugin />
          <AutoLinkPlugin matchers={MATCHERS} />
          <MentionPlugin
            getFetchUrl={function (searchPattern) {
              return `https://dummyjson.com/users?skip=0&limit=100&pattern=${searchPattern}`
            }}
            organizeResturnedList={function (data, searchPattern) {
              return Array.from(data.users).filter(user => {
                return user.username.indexOf(searchPattern) >= 0
              }).map(user => user.username).sort(function (name1, name2) {
                return name1.indexOf(searchPattern) - name2.indexOf(searchPattern)
              })
            }}

          />
          <SepNodePlugin />
          {/* <BeautifulMentionsPlugin menuComponent={CustomMenu} menuItemComponent={CustomMenuItem} triggers={["@", "#"]}
            //items={mentionItems}
            onSearch={function (tag) {
              return Promise.resolve(tag === "@" ? ["aaa", "bbb", "ccc"] : ["eee", "fff", "ggg"])
            }}
          /> */}

          <OnChangePlugin onChange={function (editorState, editor) {




            const keys = editor.getEditorState().read(

              () => {


                setHtml($generateHtmlFromNodes(editor));

                //   console.log(JSON.stringify(editor.getEditorState().toJSON()))
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

          <LinkCommandPlugin />
          <ToolBarPlugin buttons={[<FormatButton />, <LinkButton />,]} />

          <div><b>History</b></div>
          <HistoryButton />
          <div><b>List</b></div>
          <ListButton />
          <div><b>Align Actions</b></div>
          <AlignButton />
          <HeadingCommandPlugin />
          <div><b>Heading</b></div>
          <HeadingButton />
          <div><b>Indent</b></div>
          <IndentButton />
          <div><b>Banner</b></div>
          <BannerCommandPlugin />
          <BannerCommandPlugin1 />
          <BannerButton />
          <BannerButton1 />
          <BannerColorButton />
          <div><b>Image</b></div>
          <ImageCommandPlugin />
          <ImageButton />
          <div><b>Table</b></div>
          <TablePlugin />
          <TableButton />
          <div><b>Tree</b></div>
          <TreeViewPlugin />

          {/* <LexicalClickableLinkPlugin /> */}



        </LexicalComposer>
        {parse(html, {

          replace({ attribs, children, name, ...args }) {
            // console.log(name)
            if (attribs && Object.keys(attribs).includes("data-type")) {
              if (attribs["data-type"] === "MentionNode") {

                return (
                  <button style={{ backgroundColor: "orange", borderWidth: 0, userSelect: "none" }}>
                    {attribs["data-name"]} {attribs["data-increment"]}
                  </button>
                )

                //if want keep the comming Tag, do the following
                //const CustomTag = name;
                // return (

                //   <CustomTag {...attribs}>
                //     <button style={{ backgroundColor: "orange", borderWidth: 0, userSelect: "none" }}>
                //       {attribs["data-name"]} {attribs["data-increment"]}
                //     </button>
                //     {domToReact(children, options)}
                //   </CustomTag>

                // )
              }
              else if (attribs["data-type"] === "ImageNode") {

                console.log(attribs["data-width"], attribs["data-height"],)

                return (
                  <img style={{
                    backgroundColor: "lightblue", objectFit: "contain",
                    objectFit: "contain", background: "lightblue",

                    maxWidth: attribs["data-width"] + "px",// 200,
                    maxHeight: attribs["data-height"] + "px",//200, 
                  }}

                    src={attribs["data-url"]}
                  //    width={attribs["data-width"]}
                  //    height={attribs["data-height"]} 
                  />


                )
              }
            }


            return
          },


        })}

      </div >
    </>
  )
}


const options = {
  replace({ attribs, children }) {
    if (!attribs) {
      return;
    }

    if (attribs.id === 'main') {
      return <h1 style={{ fontSize: 42 }}>{domToReact(children, options)}</h1>;
    }

    if (attribs.class === 'prettify') {
      return (
        <span style={{ color: 'hotpink' }}>
          {domToReact(children, options)}
        </span>
      );
    }
  },
};



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

