import logo from './logo.svg';
import './App.css';

import Editor from './Editor';
import { Editor2 } from './Editor2';
import ContentEditable from 'react-contenteditable'
//import Editor3 from './Editor3';

import React from "react"
import { Resizable, ResizableBox } from 'react-resizable';


function App_() {
  const [width, setWidth] = React.useState(200);
  const [height, setHeight] = React.useState(200);

  return (
    <ResizableBox
      width={width}
      height={height}
      onResize={(event, { element, size }) => {
        setWidth(size.width);
        setHeight(size.height);
      }}
      handle={<div className="box" >aaa</div>}
    // draggableOpts={{grid: [25, 25]}}
    >
      <img className="box" src="https://picsum.photos/200/300" style={{ backgroundColor: "pink", minWidth: width, minHeight: height, objectFit: "contain" }} />

    </ResizableBox>
  );
}

const MyHandle = React.forwardRef((props, ref) => {
  const { handleAxis, ...restProps } = props;
  return <div ref={ref} className={`foo handle-${handleAxis}`} {...restProps} />;
});
function App() {

  return (
    <>



      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100vh", backgroundColor: "gray" }}  >





        {/* <div style={{ backgroundColor: "pink" }}

        draggable="true"
        onDragStart={function (e) {
          // e.dataTransfer.effectAllowed="none"

          e.target.style.opacity = '0.4';

          e.dataTransfer.setData('aaa', JSON.stringify({name:"bbdkslk"}));

        }}
        onDrag={function (e) {


        }}
        onDragEnd={function (e) {
          e.target.style.opacity = '1';

        }}

      >aaaaa</div>

      <div style={{ backgroundColor: "lightblue" }}

        draggable
        onDragEnter={function (e) {
          e.preventDefault();

          e.target.style.backgroundColor = "blue"



        }}
        onDragLeave={function (e) {

          e.target.style.backgroundColor = "lightblue"

        }}

        onDragOver={function (e) {
          e.preventDefault()
        }}

        onDrop={function (e) {
          e.target.style.backgroundColor = "lightblue"
          const sourceE = e.dataTransfer.getData("aaa")
          console.log( JSON.parse(sourceE).name)
        }}

      // onDrag={function (e) {

      //   console.log("dragStart")
      // }}
      // onDragEnd={function (e) {

      //   console.log("dragEnd")
      // }}

      >bbb</div> */}


        {/* <Editor/> */}
        <div style={{ marginTop: "50px" }}>
          <Editor2 />
        </div>
        {/* <MyComponent      /> */}





      </div>
    </>
  );
}

export default App;



class MyComponent extends React.Component {
  constructor() {
    super()
    this.contentEditable = React.createRef();
    this.state = { html: "<b>Hello <i>World</i></b>" };
  };

  handleChange = evt => {
    this.setState({ html: evt.target.value });

  };

  render = () => {
    return <ContentEditable
      innerRef={this.contentEditable}
      html={this.state.html} // innerHTML of the editable div
      disabled={false}       // use true to disable editing
      onChange={this.handleChange} // handle innerHTML change
      tagName='article' // Use a custom HTML tag (uses a div by default)
    />
  };
};