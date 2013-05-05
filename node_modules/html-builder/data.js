/*global exports:false*/
var styles = [
    //google font for mobile ?
    // 'http://fonts.googleapis.com/css?family=Droid+Serif:400,400italic,700'
    
    //css framework
    "bootstrap"
    
    //The iconic font designed for use with Twitter Bootstrap
    ,"font-awesome"

    //some reset rules
    ,'reset'
    
    //
    ,'main'
    
    //Message bar on top of page
    ,'message-top'
    ,'social'
    ,'contact'
    
    /* Turns menu classed ul, li structure into a dropdown menu  */
    // ,"menu"
    ,'superfish'
    
    //sequence theme
    // ,'slidein-seqtheme'
    
    // ,'flexslider'
    ,'camera'
    
    
    //FancyBox is a tool for displaying images, html content and
    // multi-media in a Mac-style "lightbox" that floats overtop
    // of web page, the css part
    // ,"fancybox"
    
    
    
    // ,'misc'
    
    //footer
    // ,'photo-stream'
    // ,'footer-twitter-widget'
    
    // ,'entry-title'
    // ,'footer'
    //Css for flex-slider
    // ,'flex-slider'
    // ,'style-responsive' 
    // This file overrides the default bootstrap. The reason
    // is to achieve a small width
    // ,'override'
    
    // ,{name: 'ribbons', id: 'ribbons'}
    
    // Theme created for use with Sequence.js
    // Theme: Modern Slide In
    // ,'sequence'
    //extra responsive rules
    
    //colors, with extra attrs so styles switcher can find it
    // ,{ name: 'colors/default', media: 'all', id: 'colors'}
    // ,{ name: 'colors/default', media: 'all', id: 'colors'}
];

var scripts = [
    //Reload when any files change, not using it now, using
    // Firefox autoreload
    // 'livepage',
    
    //Version 1.7.2
    'jquery',
    // 'jquery-1.9.1.min.js',
    
    // Modernizr is a small JavaScript library that detects the
    // availability of native implementations for next-generation
    // web technologies, i.e. features that stem from the HTML5
    // and CSS3 specifications. Many of these features are already
    // implemented in at least one major browser (most of them in
    // two or more), and what Modernizr does is, very simply, tell
    // you whether the current browser has this feature natively
    // implemented or not.
    // 'modernizr',
    
    // An awesome, fully responsive jQuery slider toolkit.
    // 'flexslider',
    
    // 'twitter',//??
    
    //FancyBox is a tool for displaying images, html content and
    // multi-media in a Mac-style "lightbox" that floats overtop
    // of web page.
    // 'fancybox',
    
    // An exquisite jQuery plugin for magical layouts
    // Features:
    // Layout modes: Intelligent, dynamic layouts that can’t be achieved with CSS alone.
    // Filtering: Hide and reveal item elements easily with jQuery selectors.
    // Sorting: Re-order item elements with sorting. Sorting data
    // can be extracted from just about anything.
    // Interoperability: features can be utilized together for a
    // coheive experience.
    // Progressive enhancement: Isotope’s animation engine takes
    // advantage of the best browser features when available — CSS
    // transitions and transforms, GPU acceleration — but will
    // also fall back to JavaScript animation for lesser browsers.
    // 'isotope',
    
    //css framework
    'bootstrap'
    
    
    ,'hoverIntent'
    ,'superfish'
    
    
    // The Responsive Slider with Advanced CSS3 Transitions
    // ,'sequence.jquery-min'
    // ,'sequence'
    
    //flexslider
    // ,'jquery.flexslider-min'
    
    
    ,'jquery.mobile.customized.min'
    ,'jquery.easing.1.3'
    ,'camera.min'
    
    ,'myjs'
    
    
    // A lightweight, easy-to-use jQuery plugin for fluid width video embeds.       
    // ,'jquery.fitvids'
    
    //Tweaks: Menu slide, responsive menu, image overlay, fancybox and icon spin
    // ,'custom'
    
    //Tweaks: Menu slide, responsive menu
    // ,'menu-slide'
    
    //* Converts your <ul>/<ol> navigation into a dropdown list for small screens
    // ,'selectnav'
    
    
    // ,'twitter'
    
    // Parallax Content Slider with CSS3 and jQuery A content
    // slider with delayed animations and background parallax effect
    // ,'jquery.cslider.js'
];

var menu = [
    { label: 'Home', icon: '', href: '#', id: 'current'
      
      // ,sub: [
      //     { label: 'Submenu item 1', href: 'index.html'}
      //     ,{ label: 'Submenu item 2', href: 'index.html'}
      //     ,{ label: 'Submenu item 2', href: 'index.html'}
      // ]
    } 
    ,{ label: 'About us', icon: '', href: '#',
       sub: [
           { label: 'Contact', href: 'index.html'}
           ,{ label: 'The team', href: 'index.html'}
       ]
     } 
    ,{ label: 'Courses', icon: '', href: '#'
       ,sub: [
           { label: 'Disability care', href: 'index.html'}
           ,{ label: 'Children services', href: 'index.html'}
           ,{ label: 'Management training', href: 'index.html'}
           ,{ label: 'Aged care', href: 'index.html'}
       ]
     } 
    ,{ label: 'Professional developement', icon: '', href: '#'
       ,sub: [
           { label: 'The Inspired Educator', href: 'index.html'}
           ,{ label: 'Observation, documentation, planning and evaluating', href: 'index.html'}
           ,{ label: 'Environment and experiences', href: 'index.html'}
           ,{ label: 'Developing Cooperative Behaviour', href: 'index.html'}
       ]
     } 
    ,{ label: 'Resources', icon: '', href: '#'
       ,sub: [
           { label: 'Submenu item 1', href: 'index.html'}
           ,{ label: 'Submenu item 2', href: 'index.html'}
           ,{ label: 'Submenu item 2', href: 'index.html'}
       ]
       
     } 
    ,{ label: 'Blog', icon: '', href: '#'
       ,sub: [
           { label: 'Submenu item 1', href: 'index.html'}
           ,{ label: 'Submenu item 2', href: 'index.html'}
           ,{ label: 'Submenu item 2', href: 'index.html'}
       ]
       
     } 
];


var slides =  [
    { url: "images/courses/agedcare/hands.jpg",
      title: 'Aged care',
      subtitle: 'Aged care slogan'},
    { url: "images/courses/managementtraining/alone.jpg",
      title: 'Management training',
      subtitle: 'Slogan'},
    { url: "images/courses/childrenservices/children.jpg",
      title: 'Children services',
      subtitle: 'Slogan'},
    { url: "images/courses/disabilitycare/withcarer1244x450.jpg",
      title: 'Disability',
      subtitle: 'Slogan'}
];


var data = {
    verbose: true
    ,monitor: true
    ,basePath: '/home/michieljoris/www/firstdoor/'
    ,partialsPath: 'partials/' 
    ,layoutPartial: 'fromscratch'
    ,layoutIdPrefix: 'layout'
    ,paths: {
        js: 'js'
        ,css: 'css'
        ,font: 'font'
    }
    ,out: 'myindex.html'
    ,scripts: scripts
    ,styles: styles
    ,title : 'First Door'
    ,metaTags : [
        { charset:'utf-8' },
        { name: "viewport"
          ,content: "width=device-width, initial-scale=1, maximum-scale=1"
        } ]
    // fonts: [
    // ],
    ,menu: menu
    ,partials: {
        message: 'message'
        ,logo: 'logo'
        ,social: 'social'
        ,contact: 'contact'
        ,studentLogin: 'wisenet-login'
        ,search: 'search'
        ,home: 'aboutus.md'
        ,sidebar: 'sidebar'
        
        ,footerLeft: 'footerLeft'
        ,footerMiddle: 'footerMiddle'
        ,footerRight: 'footerRight'
        ,'footerBottom': 'footerBottom'
        // ,slider: 'sequence-slider'
        // ,slogan: 'slogan'
        // ,sections: 'sections'
        // ,'footer-bottom': 'footer-bottom'
    }
    ,prettyPrintHtml: false
};

