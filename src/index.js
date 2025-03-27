document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.querySelector("#quote-list");
    const form = document.querySelector("#new-quote-form");
    
   
    if (!quoteList) {
        console.error("Error: #quote-list not found");
        return;
    }

    const sortBtn = document.createElement("button");
    sortBtn.textContent = "Sort by Author";

    
    quoteList.parentNode.insertBefore(sortBtn, quoteList);

    let sortByAuthor = false;

    function fetchQuotes() {
        let url = "http://localhost:3000/quotes?_embed=likes";
        if (sortByAuthor) url = "http://localhost:3000/quotes?_sort=author&_embed=likes";

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch quotes");
                return response.json();
            })
            .then(quotes => {
                quoteList.innerHTML = "";
                quotes.forEach(renderQuote);
            })
            .catch(error => console.error("Error fetching quotes:", error));
    }

    function renderQuote(quote) {
        const li = document.createElement("li");
        li.className = "quote-card";
        li.innerHTML = `
            <blockquote class="blockquote">
                <p class="mb-0">${quote.quote}</p>
                <footer class="blockquote-footer">${quote.author}</footer>
                <br>
                <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
                <button class='btn-danger'>Delete</button>
                <button class='btn-edit'>Edit</button>
            </blockquote>
        `;

        
        li.querySelector(".btn-success").addEventListener("click", () => likeQuote(quote, li));

        
        li.querySelector(".btn-danger").addEventListener("click", () => deleteQuote(quote.id, li));

       
        li.querySelector(".btn-edit").addEventListener("click", () => editQuote(quote, li));

        quoteList.appendChild(li);
    }

    function likeQuote(quote, li) {
        fetch("http://localhost:3000/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId: quote.id, createdAt: Date.now() }),
        })
        .then(response => response.json())
        .then(() => {
            const likesSpan = li.querySelector("span");
            likesSpan.textContent = parseInt(likesSpan.textContent) + 1;
        })
        .catch(error => console.error("Error liking quote:", error));
    }

    function deleteQuote(id, li) {
        fetch(`http://localhost:3000/quotes/${id}`, { method: "DELETE" })
        .then(() => li.remove())
        .catch(error => console.error("Error deleting quote:", error));
    }

    function editQuote(quote, li) {
        const form = document.createElement("form");
        form.innerHTML = `
            <input type="text" name="quote" value="${quote.quote}">
            <input type="text" name="author" value="${quote.author}">
            <button type="submit">Update</button>
        `;

        li.appendChild(form);
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const updatedQuote = form.quote.value;
            const updatedAuthor = form.author.value;

            fetch(`http://localhost:3000/quotes/${quote.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote: updatedQuote, author: updatedAuthor }),
            })
            .then(response => response.json())
            .then(updatedQuote => {
                li.querySelector(".mb-0").textContent = updatedQuote.quote;
                li.querySelector(".blockquote-footer").textContent = updatedQuote.author;
                form.remove();
            })
            .catch(error => console.error("Error updating quote:", error));
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const newQuote = {
            quote: e.target.quote.value,
            author: e.target.author.value,
            likes: [],
        };

        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote),
        })
        .then(response => response.json())
        .then(renderQuote)
        .catch(error => console.error("Error adding new quote:", error));

        form.reset();
    });

    sortBtn.addEventListener("click", () => {
        sortByAuthor = !sortByAuthor;
        sortBtn.textContent = sortByAuthor ? "Sort by ID" : "Sort by Author";
        fetchQuotes();
    });

    fetchQuotes();
});
