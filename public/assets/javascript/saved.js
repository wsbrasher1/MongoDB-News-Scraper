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

        
    }
})