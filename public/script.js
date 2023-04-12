function Delete() {
    fetch('/delete-task/' + event.target.dataset.id, {
        method: 'DELETE'
    }).then(res => {
        window.location.reload();
    })
}

function calctimeuntil(element) {
    // Set the target date
    const targetDate = new Date(element.dataset.date);

    // Get the current date
    const currentDate = new Date();

    // Calculate the time difference in milliseconds
    const timeDiff = targetDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days, hours, minutes, and seconds
    // if less than a day left
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    if (timeDiff < 86400000) {
        element.querySelector('strong').style.color = 'red';
    }
    if (timeDiff < 0) {
        element.querySelector('strong').innerHTML = `Deadline passed ${Math.abs(days)} days, ${Math.abs(hours)} hours, ${Math.abs(minutes)} minutes, ${Math.abs(seconds)} seconds ago.`
        return;
    }

    element.querySelector('strong').innerHTML = `The deadline is in ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds.`
}

document.querySelectorAll('[data-date]').forEach(element => {
    setInterval(() => {
        calctimeuntil(element)
    }, 1000)
})

function EditTask() {
    const element = event.target;
    const data = element.dataset.data;
    console.log(data);
    element.parentElement.innerHTML += `
    <form action="/edit-task/:${data._id}" method="POST">
        <input type="text" name="Goal" value="${data.Goal}">
        <input type="text" name="Requirements" value="${data.Requirements}">
        <input type="date" name="Deadline" value="${data.Deadline}">
        <input type="submit" value="Edit">
    </form>
    `
}

function GetDate(el) {
    const date = el.dataset.specialdate;
    const dateObj = new Date(date);
    let month = dateObj.getMonth() + 1;
    if (month < 10) {
        month = `0${month}`
    }
    let day = dateObj.getDate();
    if (day < 10) {
        day = `0${day}`
    }
    newValue = `${dateObj.getFullYear()}-${month}-${day}`
    el.value = newValue;
    console.log(el.value)

}

document.querySelectorAll('[data-specialdate]').forEach(element => {
    GetDate(element);
})

function search() {
    const search = document.getElementById('search').value;
    const listitems = document.querySelectorAll('.view-tasks>li');
    listitems.forEach(element => {
        if (element.querySelector('h3').innerHTML.toLowerCase().includes(search.toLowerCase()) || element.querySelector('.reqs').innerHTML.toLowerCase().includes(search.toLowerCase())) {
            element.style.display = 'flex';
        } else {
            element.style.display = 'none';
        }
    })
}