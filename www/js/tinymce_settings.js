
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
        // {title: 'Bold text', inline: 'b'},
        // {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
        {title: 'Header 1', block: 'h1', styles: {}},
        {title: 'Header 2', block: 'h2', styles: {}},
        {title: 'Header 3', block: 'h3', styles: {}},
        {title: 'Header 4', block: 'h4', styles: {}},
        {title: 'Header 5', block: 'h5', styles: {}},
        {title: 'Burnt-orange', inline: 'span', styles: {color: '#f26500'}}
        // {title: 'Example 2', inline: 'span', classes: 'example2'}
    ]
}); 

