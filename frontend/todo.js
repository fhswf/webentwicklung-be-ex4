

let todos = [];
const status = ["offen", "in Bearbeitung", "erledigt"];

const API = "/todos"
const LOGIN_URL = "https://jupiter.fh-swf.de/keycloak/realms/webentwicklung/protocol/openid-connect/auth"

function createTodoElement(todo) {
    let list = document.getElementById("todo-list");
    let due = new Date(todo.due);
    list.insertAdjacentHTML("beforeend",
        `<div>${todo.title}</div> 
         <div>${due.toLocaleDateString()}</div>
         <button class="status" onclick="changeStatus('${todo._id}')">${status[todo.status || 0]}</button>
         <button class="edit" onclick="editTodo('${todo._id}')">Bearbeiten</button>
         <button class="delete" onclick="deleteTodo('${todo._id}')">Löschen</button>`);
}

function showTodos() {
    let todoList = document.getElementById("todo-list");

    // Clear the todo list
    todoList.innerHTML = "";

    // Add all todos to the list
    todos.forEach(todo => {
        createTodoElement(todo);
    });
}

function initForm(event) {
    event.preventDefault();

    // Reset the form
    event.target.title.value = "";
    event.target.submit.value = "Todo hinzufügen";
    // Reset the id. This is used to determine if we are editing or creating a new todo.
    event.target.dataset.id = "";

    // Set the default due date to 3 days from now
    event.target.due.valueAsDate = new Date(Date.now() + 3 * 86400000);
}

async function init() {
    // Get todos from loacal storage
    todos = await loadTodos();
    console.log("Loaded todos: %o", todos);

    // Reset the form
    document.getElementById("todo-form").reset();

    // Show all todos
    showTodos();
}

function saveTodo(evt) {
    evt.preventDefault();

    // Get the id from the form. If it is not set, we are creating a new todo.
    let id = evt.target.dataset._id || "";
    console.log("Saving todo with id: %s", id);

    let todo = {
        _id: id,
        title: evt.target.title.value,
        due: evt.target.due.valueAsDate,
        status: Number.parseInt(evt.target.status.value) || 0
    }

    let index = todos.findIndex(t => t._id === id);
    if (id && index >= 0) {
        console.log("Updating todo: %o", todo);
        fetch(API + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(todo)
        })
            .then(response => {
                console.log("PUT %s: %o", API + "/" + id, response)
                if (response.status != 200) throw response;
                return response.json()
            })
            .then(response => {
                todos[index] = response
                console.log("Updated todo: %o", todo)
                showTodos()
            })
            .catch(err => {
                console.log("PUT %s failed: %o", API + "/" + id, err)
                return err.json()
            })
            .then(err => {
                console.log("Error: %o", err)
                alert("Fehler beim Speichern des Todos: " + err.map(f => f.msg) + "\nBitte versuchen Sie es erneut.")
            })
    } else {
        console.log("Saving new todo: %o", todo);
        fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(todo)
        })
            .then(response => {
                console.log("POST %s: %o", API, response)
                if (response.status != 201) throw response;
                return response.json()
            })
            .then(response => {
                todo = response
                console.log("Saved todo: %o", todo)
                todos.push(todo);
                showTodos();
            })
            .catch(err => {
                console.log("POST %s failed: %o", API, err)
                return err.json()
            })
            .then(err => {
                console.log("Error: %o", err)
                alert("Fehler beim Speichern des Todos: " + err.map(f => f.msg) + "\nBitte versuchen Sie es erneut.")
            })
    }
    evt.target.reset();
}

function editTodo(id) {
    let todo = todos.find(t => t._id === id);
    console.log("Editing todo: %o", todo);
    if (todo) {
        let form = document.getElementById("todo-form");
        form.title.value = todo.title;
        form.due.valueAsDate = new Date(todo.due);
        form.status.value = todo.status;
        form.submit.value = "Änderungen speichern";
        form.dataset._id = todo._id;
    }
}

function deleteTodo(id) {
    let todo = todos.find(t => t._id === id);
    console.log("Deleting todo: %o", todo);
    fetch(API + "/" + id, {
        method: "DELETE"
    })
        .then(response => {
            console.log("DELETE %s: %o", API + "/" + id, response)
            if (response.status != 204) throw ("DELETE failed")
        })
        .then(response => {
            todos = todos.filter(t => t._id !== id)
            console.log("Deleted todo: %o", response)
            showTodos();
        })
        .catch(err => {
            console.log("DELETE %s failed: %o", API + "/" + id, err)
        })
}

function changeStatus(id) {
    let index = todos.findIndex(t => t._id === id);
    let todo = todos[index];
    console.log("Changing status of todo: %s, %o", id, todo);
    if (todo) {
        todo.status = (todo.status + 1) % status.length;
        fetch(API + "/" + id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(todo)
        })
            .then(response => {
                console.log("PUT %s: %o", API + "/" + id, response)
                return response.json()
            })
            .then(response => {
                todos[index] = response
                console.log("Updated todo: %o", todo)
                showTodos();
            })
            .catch(err => {
                console.log("PUT %s failed: %o", API + "/" + id, err)
            })

    }
}

function loadTodos() {
    return fetch(API)
        .then(checkLogin)
        .then(response => response.json())
        .then(response => {
            console.log("GET %s: %o", API, response)
            return response
        })
        .catch(err => {
            console.log("GET %s failed: %o", API, err)
            return []
        })
}


/** Check whether we need to login.
 * Check the status of a response object. If the status is 401, construct an appropriate 
 * login URL and redict there.
 * 
 * @param response Response object to check
 * @returns original response object if status is not 401
 */
function checkLogin(response) {
    // check if we need to login
    if (response.status == 401) {
        console.log("GET %s returned 401, need to log in", API)
        let state = document.cookie
            .split('; ')
            .find((row) => row.startsWith("state="))
            ?.split("=")[1]
        console.log("state: %s", state)
        let params = new URLSearchParams()
        params.append("response_type", "code")
        params.append("redirect_uri", new URL("/oauth_callback", window.location))
        params.append("client_id", "todo-backend")
        params.append("scope", "openid")
        params.append("state", state)

        // redirect to login URL with proper parameters
        window.location = LOGIN_URL + "?" + params.toString()
        throw ("Need to log in")
    }
    else return response
}