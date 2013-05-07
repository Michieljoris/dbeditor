
tinymce.init({
    selector: "textarea",
    theme: "modern",
    width: "100%",
    height: 300,
    plugins: [
        "advlist autolink autoresize charmap link image lists charmap print preview hr anchor pagebreak spellchecker",
        // "autosave",
        // "spellchecker", //not working at the moment see http://www.tinymce.com/wiki.php/Plugin:spellchecker
        "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
        "save table contextmenu directionality emoticons template paste textcolor"
    ],
    // content_css: "css/content.css",
    toolbar: "save insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | l      ink image | print preview media fullpage | forecolor backcolor emoticons", 
    save_enablewhendirty: true,
    style_formats: [
        {title: 'Bold text', inline: 'b'},
        {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
        {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
        {title: 'Example 1', inline: 'span', classes: 'example1'},
        {title: 'Example 2', inline: 'span', classes: 'example2'},
        {title: 'Table styles'},
        {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
    ]
}); 

