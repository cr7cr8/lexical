import logo from './logo.svg';
import './App.css';

import Editor from './Editor';
import { Editor2 } from './Editor2';
import ContentEditable from 'react-contenteditable'
//import Editor3 from './Editor3';

import React from "react"

function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", height: "100vh",backgroundColor:"gray" }}  >


      {/* <Editor/> */}
      <div style={{marginTop:"50px"}}>
      <Editor2 />
      </div>
      {/* <MyComponent      /> */}


      {/* <img src={"https://picsum.photos/400/500"} width={300} height={200} style={{objectFit:"contain",background:"lightblue"}} alt="BigCo Inc. logo"/> */}
     

    </div>
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