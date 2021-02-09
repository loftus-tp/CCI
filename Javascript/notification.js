(function() {
    var edit_page = ""      // TODO
    if (document.referrer.toLowerCase() === edit_page) {
        var css = `
        .alert {
            padding: 20px;
            background-color: #f44336;
            top: 0px;
            color: white;
        }

        .closebtn {
            margin-left: 15px;
            color: white;
            font-weight: bold;
            float: right;
            font-size: 22px;
            line-height: 20px;
            cursor: pointer;
            transition: 0.3s;
        }

        .closebtn:hover {
            color: black;
        }`;

        var style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);

        var div = document.createElement("div");
        div.classList.add("alert");

        var bold_text = "BOLD TEXT";    // TODO
        var message = "OTHER TEXT";     // TODO
        
        div.innerHTML = `<span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span><strong>`+bold_text+`</strong> `+message+`.`;
        document.body.appendChild(div);
    }
})()

// move button
var btn = document.getElementById("UpdateButton");
btn.parentElement.className = "pull-right";
btn.parentElement.parentElement.className = "";
