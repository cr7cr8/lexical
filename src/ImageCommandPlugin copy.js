import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useState, useRef, forwardRef } from "react";
import { Resizable, ResizableBox } from 'react-resizable';


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
    DecoratorNode,
    $getNodeByKey,

} from 'lexical';

import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { addClassNamesToElement } from "@lexical/utils"
import { LinkNode, $createLinkNode, AutoLinkNode } from "@lexical/link"

export class ImageNode extends DecoratorNode {

    constructor(url, width, height) {
        super()
        this.url = url
        this.width = width || 100
        this.height = height || 100

    }


    static importJSON(...args) {
        //   console.log(args)
        const { type, url, width, height } = args[0]
        return new ImageNode(url, width, height)
    }


    exportJSON() {

        return {
            type: "ImageNode",
            url: this.url,
            width: this.width,
            height: this.height,
            version: 1.5,
        };

    }






    setUrl(value) {
        const self = this.getWritable();
        self.url = value;
    }
    getUrl() {
        return this.url
    }
    setWidth(value) {
        const self = this.getWritable();
        self.width = value;
    }
    getWidth() {
        return this.width
    }
    setHeight(value) {
        const self = this.getWritable();
        self.height = value;
    }
    getHeight() {
        return this.height
    }
    static clone(node) {
        return new ImageNode(node.url, node.width, node.height);
    }
    isInline() {
        return true
    }
    isIsolated() {
        return true
    }
    static getType() {
        return "ImageNode"
    }
    updateDOM(prevNode, dom, config) {



        return true
        // console.log(prevNode.getUrl(), this.getUrl())
        // if (prevNode.getUrl() !== this.getUrl()) { console.log("xxx-url"); return true }

        // return false
    }

    createDOM(config) {

        const element = document.createElement("span")
        addClassNamesToElement(element, config.theme.imageNode)
        //    element.className = config.theme.banner || ""
        //    element.style.backgroundColor = "lightgreen"
        //    element.appendChild(document.createElement("hr"))
        //    element.append("test-")
        return element;

    }
    decorate(...args) {
        //  console.log(args)
        return <ReactImageNode {...args} node={this} />
        //return <MyComponent {...args} node={this} />
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
                el.setAttribute("data-url", this.url)
                el.setAttribute("data-width", this.width || 100)
                el.setAttribute("data-height", this.height || 100)
                el.setAttribute("data-type", this.getType())
                // el.append("this is a react node")
                generatedElement.appendChild(el)

                // console.log(generatedElement)

                return generatedElement



            }

        }

    }

    insertNewAfter(_selection, restoreSelection) {

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


}

function ReactImageNode(props) {
    const [editor] = useLexicalComposerContext()
    const [imageUrl, setImageUrl] = useState()

    const inputRef = useRef()

    // useEffect(() => {

    //     console.log(new Date())

    // }, [])

    // useEffect(() => {

    //     editor.update(() => {
    //         props.node.setUrl(imageUrl)
    //     })


    // }, [imageUrl])
    const [width, setWidth] = useState(props.node.width || 100);
    const [height, setHeight] = useState(props.node.height || 100);


    const [minW, setMinW] = useState(100)
    const [minH, setMinH] = useState(100)


    const [maxW, setMaxW] = useState(600)
    const [maxH, setMaxH] = useState(600)

    return (
        <>
            <input type="file" name="myImage" accept="image/png, image/gif, image/jpeg" ref={inputRef}
                hidden={true}
                onChange={e => {
                    const imageUrl = URL.createObjectURL(e.currentTarget.files[0])



                    setImageUrl(imageUrl)
                    editor.update(() => {
                        props.node.setUrl(imageUrl)
                    })


                }}

            />


            {props.node.url === "/"
                ? <button style={{}}
                    onClick={function (e) {
                        e.preventDefault()
                        inputRef.current.click()

                        editor.update(() => {

                            const imageNode = props.node
                            const parentNode = imageNode.getParent()
                            const siblingSize = imageNode.getPreviousSiblings().length




                            const selection = $getSelection()
                            const newSelection = $createRangeSelection();
                            newSelection.anchor.set(parentNode.getKey(), siblingSize + 1, "element")
                            newSelection.focus.set(parentNode.getKey(), siblingSize + 1, "element")
                            // newSelection.format = selection.getFormat()

                            console.log(selection)

                            $setSelection(newSelection)



                        })
                    }}


                >IMAGE</button>

                // : <ResizableBox
                //     width={width}
                //     height={height}
                //     style={{ display: "inline-block", position: "relative", background: "brown" }}
                //     lockAspectRatio
                //     onResize={(event, { element, size }) => {
                //         //  console.log(size)



                //         setWidth(size.width);
                //         setHeight(size.height);
                //         // editor.update(() => {
                //         //     props.node.setWidth(size.width);
                //         //     props.node.setHeight(size.height);

                //         // })

                //     }}
                //     onResizeStop={(event, { element, size }) => {
                //         editor.update(() => {
                //             props.node.setWidth(size.width);
                //             props.node.setHeight(size.height);

                //         })
                //     }}
                //     minConstraints={[minW, minH]}
                //     maxConstraints={[maxW, maxH]}

                //     resizeHandles={["se"]}
                //     className='react-resizable'
                //     // handle={
                //     //     <div className="react-resizable-handle" ></div>
                //     // }
                //     handle={<MyHandle />}

                // // draggableOpts={{grid: [25, 25]}}

                // // draggableOpts={{grid: [25, 25]}}
                // >
                //     <img className="box" src={imageUrl || props.node.url} style={{ backgroundColor: "pink", maxWidth: width, maxHeight: height, objectFit: "contain" }}

                //         onClick={function () {
                //             inputRef.current.click()

                //         }}

                //         onLoad={function (e) {
                //             if (e.target.width <= e.target.height) {

                //                 setMinW(100)
                //                 setMinH(100 * e.target.height / e.target.width)

                //                 setMaxW(600)
                //                 setMaxH(600 * e.target.height / e.target.width)
                //             }
                //             else {

                //                 setMinW(100 * e.target.width / e.target.height)
                //                 setMinH(100)

                //                 setMaxW(600)
                //                 setMaxH(600 * (e.target.height / e.target.width))
                //             }
                //             setWidth(e.target.width)
                //             setHeight(e.target.height)

                //         }}

                //     />

                // </ResizableBox>
                : <img src={imageUrl || props.node.url}

                    style={{ objectFit: "contain", background: "lightblue", width: "auto", height: "auto", 
                    
                    
                    
                    maxHeight: 200, maxWidth: 200 }}
                    alt="BigCo Inc. logo"

                    draggable={true}
                    onDragStart={function(e){
                        // console.log(e.pageX,e.pageY)
                        // e.movementX = e.pageX
                        // e.movementY = e.pageY
                    }}
                    onDrag={function(e){
                        console.log(e.movementX,e.movementY)
                    }}
                    onDragEnd={function(e){
                      //  console.log(e)
                    }}
                   


                    onResize={function(e){
                        console.log(e)
                    }}

                    onClick={function () {
                        inputRef.current.click()
                        editor.update(() => {

                            // const imageNode = props.node
                            // const parentNode = imageNode.getParent()
                            // const siblingSize = imageNode.getPreviousSiblings().length




                            // const selection = $getSelection()
                            // const newSelection = $createRangeSelection();
                            // newSelection.anchor.set(parentNode.getKey(), siblingSize + 1, "element")
                            // newSelection.focus.set(parentNode.getKey(), siblingSize + 1, "element")
                            // newSelection.format = selection.format



                            // $setSelection(newSelection)


                        })
                    }}


                    onLoad={function (e) {
                           console.log(window.getComputedStyle(e.target).width, window.getComputedStyle(e.target).height)




                    }}
                />
            }
        </>


    )



    return (
        //<span>ABC</span>
        <img src={props.node.url} width={props.node.width} height={props.node.height} style={{ objectFit: "contain", background: "lightblue" }} alt="BigCo Inc. logo"

            onClick={() => {
                console.log("image click")
            }}
        />

    )

}

export const INSERT_IMAGE = createCommand("inserImage")
export function ImageCommandPlugin() {

    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        editor.registerCommand(INSERT_IMAGE, ({ url, width, height }) => {

            const selection = $getSelection();
            const imageNode = new ImageNode(url, width, height)
            const res = selection.insertNodes([imageNode, new TextNode("")], false)
            console.log("image res", res, imageNode.__key)

            // editor.update(() => {

            //     console.log("xxx")
            //     const newSelection = $createRangeSelection();
            //     newSelection.anchor.set(imageNode.__key, 1, "element")
            //     newSelection.focus.set(imageNode.__key, 1, "element")
            //     //newSelection.format = selection.format
            //     $setSelection(newSelection)

            //     setTimeout(() => {

            //         editor.focus()
            //     }, 100);

            // })



        }, COMMAND_PRIORITY_NORMAL)






    }, [editor])



    return (
        <></>
    )
}

export function ImageButton() {

    const [editor] = useLexicalComposerContext()
    return (

        <button onClick={function (e) {
            e.preventDefault()
            e.stopPropagation()
            // editor.dispatchCommand(INSERT_IMAGE, { url: "https://picsum.photos/400/500", width: 200, height: 300 })
            editor.dispatchCommand(INSERT_IMAGE, { url: "/", width: 200, height: 300 })




        }}>Image</button>
    )

}


const MyHandle = forwardRef((props, ref) => {
    // console.log(props)
    const { handleAxis, ...restProps } = props;
    return (
        <>
            <div ref={ref}

                className="react-resizable-handle1"

                {...restProps}
            />
            <div ref={ref}

                className="react-resizable-handle2"

                {...restProps}
            />
            <div ref={ref}

                className="react-resizable-handle3"

                {...restProps}
            />
            <div ref={ref}

                className="react-resizable-handle4"

                {...restProps}
            />

        </>
    )
});