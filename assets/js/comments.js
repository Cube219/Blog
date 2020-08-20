window.addEventListener("DOMContentLoaded", event => {
    const commentsToggle = document.getElementById('load-comments');
    if (commentsToggle !== null) {
        commentsToggle.style = "display: none";
    }

    loadComments();
}, {once: true});
