import React, { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function Editor3() {

    const editorRef = useRef()


    return (
        <>
            <Editor
                apiKey='62tfn9m4q0a3mx4m4p90kpy01bd47e1rt0knfzs4hea4y9k5'
                onInit={(evt, editor) => { return editorRef.current = editor }}

                init={{
                    //  plugins: 'ai tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                    plugins: 'mentions tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',


                    toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
                    tinycomments_mode: 'embedded',
                    tinycomments_author: 'Author name',
                    mergetags_list: [
                        { value: 'First.Name', title: 'First Name' },
                        { value: 'Email', title: 'Email' },
                    ],
                    menu: true,

                    mentions_fetch: (query, success) => {
                      
                      success([{id:"aaa",name:"bob"},{id:"bbb",name:"cccc"}])
                        // Fetch your full user list from the server and cache locally
                        // if (usersRequest === null) {
                        //     usersRequest = fetch('/users');
                        // }
                        // usersRequest.then((users) => {
                        //     // query.term is the text the user typed after the '@'
                        //     users = users.filter((user) => {
                        //         return user.name.indexOf(query.term.toLowerCase()) !== -1;
                        //     });

                        //     users = users.slice(0, 10);

                        //     // Where the user object must contain the properties `id` and `name`
                        //     // but you could additionally include anything else you deem useful.
                        //     success(users);
                        // });
                    }


                    //                    ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                }}




                initialValue="Welco<b>me to Tiny</b>MCE!"
            />
            <button onClick={() => {
                console.log(editorRef.current.getContent())
            }}>submit</button>
        </>
    );
}