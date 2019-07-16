//Global bootbox
$(document).ready(function() {
    //Getting a reference to the article container div where we will be rendering the articles to
    var articleContainer = $(".article-container");
    //Adding event listeners for dynamically generated buttons for deleting articles, etc
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    //initPage kicks everything off when the page is loaded
    initPage();

    function initPage() {
        //Empty the article container, run an AJAX request for any saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function(data){
            //If we have headlines, render them to the page
            if (data && data.length) {
                renderArticles(data);
            } else {
                renderEmpty();
            }
        });
    }

    function renderArticles(articles) {
        //This function handles appending HTML containing our article data to the page
        // We are passed an array of JSON containing all available articles in our database
        var articlePanels = [];
        //We pass each article JSON object to the createPanel function which returns a bootstrap panel with our article
        for (var i = 0; i < articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        //Once we have all of the HTML for the articles stored in our articlePanels array,
        //append them to the articlePanels container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        //This function takes in a single JSON object for an article/headline
        //It constructs a jQuery element containing all of the formatted HTML for the panel
        var panel = 
        $(["<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        article.headline,
        "<a class='btn btn-danger delete'>",
        "Delete From Saved",
        "</a>",
        "<a class='btn btn-info notes'>Article Notes</a>",
        "</h3>",
        "</div>",
        "<div class='panel-body'>",
        article.summary,
        "</div>",
        "</div>"
        ].join(""));
        //We attach the articles id to the jQuery element
        //We will use this when trying to figure out which article the user wants to save
        panel.data("_id", article._id);
        //We return the constructed panel jQuery element
        return panel;
    }
    function renderEmpty() {
        //This function renders some HTML to the page explaining we don't have any articles to view
        //Using a joined array of HTML string data bc its easier to read/change than a concatenated string
        var emptyAlert = 
        $(["<div class='alert alert-warning text-center'>",
        "<h4>Nope. No new articles for you.</h4>",
        "</div>",
        "<div class='panel panel-default'>",
        "<div class='panel-heading text-center'>",
        "<h3>Would you like to browse available articles?</h3>",
        "</div>",
        "<div class='panel-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/'>Browse Articles</a></h4>",
        "</div>",
        "</div>"
        ].join(""));
        //Appending this data to the page
        articleContainer.append(emptyAlert);
        }    

    function renderNotesList(data) {
        //This function handles rendering note list items to our notes modal
        var notesToRender = [];
        var currentNote;
        if (!data.notes.length) {
            //If we have no notes just display a message
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            //If we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                //Constructs an li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                //Store the note id on the delete button for easy access
                currentNote.children("button").data("_id", data.notes[i]._id);
                //Adding our currentNote to the notestorender array
                notesToRender.push(currentNote);
            }
        }
        //Now append the notesToRender to the note container in the modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        //This function handles deleting articles/headlines
        //We grab the id of the article to delete from the panel element the delete button sits inside
        var articleToDelete = $(this).parents(".panel").data();
        //Using a delete method here
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
            //If this works out , run initPage again which will render our list of saved articles
            if (data.ok){
                initPage();
            }
        });
    }

    function handleArticleNotes() {
    //This function handles opening the notes modal and displaying our note
    //We grab the id of the article to get notes from the panel element
    var currentArticle = $(this).parents(".panel").data();
    //Grab any notes with this headline/article id
    $.get("/api/notes/" + currentArticle._id).then(function(data) {
        //Constructing our initial HTML to add to the notes modal
        var modalText = [
            "<div class='container-fluid text-center'>",
            "<h4>Notes For Article: ",
            currentArticle._id,
            "</h4>",
            "<hr />",
            "<ul class='list-group note-container'>",
            "</ul>",
            "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
            "<button class='btn btn-success save'>Save Note</button>",
            "</div>"
        ].join("");
        //Adding the formatted HTML to the note modal
        bootbox.dialog({
            message: modalText,
            closeButton: true
        });
        var noteData = {
            _id: currentArticle._id,
            notes: data || []
        };
        //Adding some information about the article and article notes to the save button
        //for easy access
        $(".btn.save").data("article", noteData);
        //renderNotesList will populate the actual note HTML inside of the modal
        renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        //This function handles what happens when a user tries to save a new note 
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        //To format and post note data
        if (newNote){
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                //When complete, close the modal
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        //To handle the deletion of notes
        //First, we grab the id of the note we want to delete
        //We stored this data on the delete button when we created it
        var noteToDelete = $(this).data("_id");
        //Perform a delete request to /api/notes
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function() {
            //When done, hide the modal
            bootbox.hideAll();
        });
    }
});