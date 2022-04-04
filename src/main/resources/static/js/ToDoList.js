let taskAddButton = document.getElementById("task-add-button");
let tasksList = document.getElementById("tasks-list");
let taskContent = document.getElementById("task-content");
let categorySelect = document.getElementById("category-list");
let counter = document.getElementById("counter");
const REST_API_ENDPOINT = 'http://localhost:8080';
HTTP_STATUS_SUCCESS = 200;
let count = 0;
counter.innerText = 0;


function updateCategoriesList() {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        let categories = JSON.parse(ajaxRequest.response);
        for (let category of categories) {
            let newOption = document.createElement("option");
            newOption.setAttribute("value", category.id);
            newOption.innerText = category.name;
            categorySelect.appendChild(newOption);
        }
    }
    //imposto metodo e l'url a cui fare la richiesta get al server
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/categories/all");
    //invio la richiesta al server
    ajaxRequest.send();
}
updateCategoriesList();

function createTask(task) {
    let newTaskLine = document.createElement("div");    
    newTaskLine.setAttribute("data-id", task.id);
    newTaskLine.setAttribute("class", "task");
    if (task.category != null) {
        newTaskLine.classList.add(task.category.color);
    }
    
    var category = categorySelect.options[categorySelect.selectedIndex].text;
    
    if (category == "Sport") {
        newTaskLine.classList.add("sport");
    }
    if (category == "Work") {
        newTaskLine.classList.add("work");
    }
    if (category == "Travel") {
        newTaskLine.classList.add("travel");
    }
    if (category == "Party") {
        newTaskLine.classList.add("party");
    }
    if (category == "Learning") {
        newTaskLine.classList.add("learning");
    }
    
    /*let newCheck = document.createElement("input");
    newCheck.setAttribute("type", "checkbox");*/

    if (task.done) {
        newTaskLine.classList.add("task-done");
        //newCheck.checked = true;
    }
    //newTaskLine.appendChild(newCheck);

    if (task.done == false) {
        counter.innerText = ++count;
    }

    let newText = document.createElement("span");
    newText.classList.add("task-text");
    newText.innerText = task.name;
    newTaskLine.appendChild(newText);
    tasksList.appendChild(newTaskLine);
    let newDate = document.createElement("span");
    newDate.classList.add("task-date");
    if (task.created == null) {
        let date = new Date();
        newDate.innerText = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    } else {
        newDate.innerText = task.created;
    }
    newTaskLine.appendChild(newDate);
    newText.addEventListener("click", function () {
        task.done = !task.done;
        let taskContent = {
            done: task.done,
            name: task.name
        };
        setDone(task.id, taskContent, () => {
            newTaskLine.classList.toggle("task-done");
            edit.style.visibility = task.done ? "hidden" : "visible";
            if (task.done) {
                counter.innerText = --count;
            } else {
                counter.innerText = ++count;
            }
        });

    });

    let edit = document.createElement("button");
    edit.style.visibility = task.done ? "hidden" : "visible";
    edit.setAttribute("class", "edit");
    edit.innerHTML = '<i class="fas fa-edit"></i>';

    newTaskLine.appendChild(edit);

    edit.addEventListener("click", function () {
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", "input-edit-" + task.id);

        if (newTaskLine.classList.contains("editing")) {
            let inputEdit = document.getElementById("input-edit-" + task.id);
            let taskContent = {
                done: task.done,
                name: inputEdit.value
            };
            updateTask(task.id, taskContent, () => {
                task.name = inputEdit.value;
                console.log(inputEdit);
                newText.innerText = task.name;
                inputEdit.replaceWith(newText);
                edit.innerHTML = '<i class="fas fa-edit"></i>';
                newTaskLine.classList.remove("editing");              
            });

        } else {
            //sostituisco lo span con l'imput
            input.value = task.name;
            newText.replaceWith(input);
            //sostituisco l pennetta col dischetto
            edit.innerHTML = '<i class="fas fa-save"></i>';
            newTaskLine.classList.add("editing");          
        }
    });

    let trash = document.createElement("button");
    trash.setAttribute("class", "bin");
    trash.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 6 16">
    <path fill-rule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
    <path fill-rule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
    </svg>`;
    newTaskLine.appendChild(trash);
    trash.addEventListener("click", function () {
        deleteTask(task.id, newTaskLine);
        if (!task.done) {
            counter.innerText = --count;
        }
    })
}


function updateTask(taskId, taskContent, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            succesfullCallback();
        }
    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function setDone(taskId, taskContent, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            succesfullCallback();
        }
    }
    ajaxRequest.open("PUT", REST_API_ENDPOINT + "/tasks/" + taskId + "/set-done");
    ajaxRequest.setRequestHeader("content-type", "application/json");
    ajaxRequest.send(JSON.stringify(taskContent));
}

function updateTasksList() {
    tasksList.innerHTML = "";
    //recupero i dati dal server
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = function () {
        let tasks = JSON.parse(ajaxRequest.response);
        for (let task of tasks) {
            createTask(task);
        }
    }
    ajaxRequest.open("GET", REST_API_ENDPOINT + "/tasks/");
    ajaxRequest.send();
}
updateTasksList();

function saveTask(taskToSave, succesfullCallback) {
    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.status == HTTP_STATUS_SUCCESS) {
            let savedTask = JSON.parse(ajaxRequest.response);
            succesfullCallback();
            createTask(savedTask);
        }

    }
    ajaxRequest.open("POST", REST_API_ENDPOINT + "/tasks/add");
    // dal momento che il server è di di tipo REST-full utilizza il tipo JSON per scambiare informazioni con il front end
    // pertanto il server SPRING si aspetterà dei dati in formato JSON e NON considererà richieste in cui il formato
    // non è specificato nella Header della richiesta stessa

    ajaxRequest.setRequestHeader("content-type", "application/json");
    let body = {
        name: taskToSave.name,
        category: {
            id: taskToSave.categoryId
        },
        created: new Date().toISOString()
    };
    ajaxRequest.send(JSON.stringify(body));

}

function deleteTask(taskId, taskHtmlElement) {

    let ajaxRequest = new XMLHttpRequest();
    ajaxRequest.onload = () => {
        if (ajaxRequest.response == "ok") {
            taskHtmlElement.remove();
        }
    }
    ajaxRequest.open("DELETE", REST_API_ENDPOINT + "/tasks/" + taskId);
    ajaxRequest.send();
    
}

taskAddButton.addEventListener("click", function () {

    let taskContentValue = taskContent.value;
    if (taskContentValue.length < 1) {
        return;
    }
    let task = {
        name: taskContentValue,
        categoryId: categorySelect.value
    };
    
    saveTask(task, () => {
        taskContent.value = "";
    });

})
