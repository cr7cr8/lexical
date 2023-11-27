import { useEffect, useState, useMemo, useLayoutEffect } from 'react';
import { $getRoot, $getSelection, $createParagraphNode, $createTextNode, $isRangeSelection, ParagraphNode, $setSelection, $insertNodes, TextNode, $createRangeSelection } from 'lexical';
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
import { ListNode, ListItemNode, $createListNode, $createListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list"


import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { LinkCommandPlugin, INSERT_LINK_COMMAND } from "./LinkCommandPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin"


import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"

import { $generateHtmlFromNodes } from '@lexical/html';
import parse from 'html-react-parser';

import { CustomParagraphNode, BannerNode, BannerPlugin, INSERT_BANNER_COMMAND, $createBannerNode, TableNode, TablePlugin } from './CustomParagraphNode';
import TreeViewPlugin from "./TreeViewPlugin";
// Get editor initial state (e.g. loaded from backend)

import { SepNode, SepNodePlugin } from "./SepNode"
import { ToolBarPlugin, LinkButton } from './ToolBarPlugin';

const value = `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"hfhgfh","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`
function prepopulatedRichText(editor) {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
        const paragraph = $createParagraphNode();
        paragraph.append(
            $createTextNode("The playground is a demo environment built with "),
            $createTextNode("The playground is a demo environment built with hihihihihihihihi "),
            $createTextNode("@lexical/react").toggleFormat("code"),
            $createTextNode(".bus"),
            $createLinkNode("http://baidu.com", { target: "new", title: "hihihi", }).append(
                $createTextNode("abcdefhilmnorstuv"),
            ),
            $createTextNode(" Try typing in "),
            $createTextNode("some text").toggleFormat("bold"),
            $createTextNode(" with "),
            $createTextNode("different").toggleFormat("italic"),
            $createTextNode(" free the cat.").setStyle("color:red")
        );
        root.append(paragraph);

    }

}
const theme = {
    // Theme styling goes here
    //paragraph: "editor-paragraph",
    paragraph: "margin0",
    heading: {
        h1: 'margin0',
        h2: 'margin0',
        h3: 'margin0',
        h4: 'margin0',
        h5: 'margin0',
        h6: 'margin0',
    },
    customParagraph: "margin111",
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
}
function onError(error) {
    console.error(error);
}

function MyCustomAutoFocusPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        // Focus the editor when the effect fires!
        editor.focus();
    }, [editor]);

    return null;
}

function MyPlugin({ setHtml }) {

    const [editor] = useLexicalComposerContext();

    useLayoutEffect(() => {
        editor.update(() => {
            const editorState = editor.getEditorState();
            const jsonString = JSON.stringify(editorState);
            //    console.log('jsonString', jsonString);

            const htmlString = $generateHtmlFromNodes(editor, null);



            //  console.log('htmlString', htmlString);
            setHtml(htmlString)
        })
    }, [])


    useEffect(() => {

        return editor.registerDecoratorListener(
            (decorators) => {
                // The editor's decorators object is passed in!
                //    console.log(decorators);
            },
        );

        // Do not forget to unregister the listener when no longer needed!


    }, [editor])

    useEffect(() => {
        return editor.registerNodeTransform(TextNode, (textNode) => {

            const regx = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*) /
            const matchedPart = textNode.getTextContent()?.match(regx) && textNode.getTextContent()?.match(regx)[0]
            if (matchedPart) {
                // textNode.setTextContent('green');
                //  $insertNodes([$createBannerNode()])


                editor.update(() => {
                    // Get the RootNode from the EditorState
                    const root = $getRoot();


                    //console.log(root.getTextContent())
                    // Get the selection from the EditorState

                    const selection = $getSelection();
                    const currentNode = selection.getNodes()[0]
                    console.log($isRangeSelection(selection))
                    if ($isRangeSelection(selection) && currentNode.getParent().getType() === "paragraph") {
                        //  console.log(selection.anchor.offset, selection.focus.offset)


                        let linknode = $createLinkNode("fake.com")
                        const contentNode = $createTextNode(matchedPart)
                        linknode = linknode.append(contentNode)
                        // selection.insertNodes([$createLinkNode("fake.com").append($createTextNode(matchedPart)), new TextNode(" ")], false)
                        selection.insertNodes([linknode], false)
                        currentNode.setTextContent(currentNode.getTextContent().replace(matchedPart, ""))
                        linknode.selectNext()



                        // console.log(selection.getNodes()[0].getParent())

                        // const currentNode = selection.getNodes()[0] //.setStyle("color:blue")
                        // currentNode.insertAfter($createLinkNode("fake.com").append($createTextNode(matchedPart)))


                        // currentNode.setTextContent(currentNode.getTextContent().replace(regx ,""))

                        // currentNode.getNextSibling().selectStart()






                        //   currentNode.replace($createBannerNode())

                        //   console.log(selection.getNodes())
                        //    $patchStyleText(selection, { "color": "green", "font-weight": "600" })

                        //  $setBlocksType(selection, () => $createHeadingNode("h3"))
                    }
                });



            }

        });

    }, [editor])



    return (
        <>
            <button onClick={function () {



                editor.update(() => {
                    // Get the RootNode from the EditorState
                    const root = $getRoot();
                    //console.log(root.getTextContent())
                    // Get the selection from the EditorState
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        //  console.log(selection.anchor.offset, selection.focus.offset)

                        console.log(selection.getNodes())
                        $patchStyleText(selection, { "color": "green", "font-weight": "600" })

                        //  $setBlocksType(selection, () => $createHeadingNode("h3"))
                    }
                });
            }}>Header</button>


            <button onClick={function () {
                editor.dispatchCommand(INSERT_BANNER_COMMAND, null)
            }}>Banner</button>


            <button onClick={function () {


                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, null)
            }}>List</button>

            <button onClick={function () {
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, null)
            }}>List2</button>

            <button onClick={function () {


                editor.update(() => {
                    const selection = $getSelection();
                    // $insertNodes([$createParagraphNode()]) 

                    if ($isRangeSelection(selection)) {

                        $patchStyleText(selection, { "color": "green", "font-weight": "600" })

                        console.log(selection.getNodes())

                    }

                })
            }}>MakeLink</button>



        </>
    )
}


export default function Editor() {

    const [html, setHtml] = useState("")
    const initialConfig = {
        namespace: 'MyEditor',
        theme,
        onError,
        nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, ParagraphNode, BannerNode, AutoLinkNode,
            CustomParagraphNode, TableNode, SepNode
            // {
            //     replace: ParagraphNode,
            //     with: (node) => {
            //         return new CustomParagraphNode();
            //     }
            // }


        ],
        editorState: prepopulatedRichText
    }




    return (
        <div style={{ width: "700px", backgroundColor: "pink", marginLeft: "0px" }}>
            <LexicalComposer initialConfig={initialConfig}>
                <RichTextPlugin
                    contentEditable={<ContentEditable style={{ backgroundColor: "wheat", paddingLeft: "4px", paddingRight: "4px", borderRadius: "1px", borderStyle: "solid" }} />}
                    placeholder={<div>Enter some text...</div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <LinkCommandPlugin />
                <ListPlugin />
                <ToolBarPlugin buttons={[<LinkButton />]} />
                {/* <AutoLinkPlugin /> */}
                {/* <MyCustomAutoFocusPlugin /> */}
                <MyPlugin setHtml={setHtml} />
                <BannerPlugin />
                <OnChangePlugin onChange={function (editorState, editor) {
                    //  console.log(editorState.toJSON())
                    // editor.update(() => {
                    //     const editorState = editor.getEditorState();
                    //     const jsonString = JSON.stringify(editorState);
                    //     //  console.log('jsonString', editor.getEditorState());

                    //     const htmlString = $generateHtmlFromNodes(editor, null);
                    //     //console.log('htmlString', htmlString);
                    //     setHtml(htmlString)
                    // });
                }} />
                <TablePlugin />
                <SepNodePlugin />
                <TreeViewPlugin />
            </LexicalComposer>
            {/* {parse(html)} */}

        </div>
    )




}