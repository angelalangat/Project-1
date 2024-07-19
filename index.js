document.addEventListener('DOMContentLoaded', () => {

    // About nav button
    const aboutLink = document.getElementById('about-link');
    const aboutSection = document.getElementById('about-section');

    aboutLink.addEventListener('click', (event) => {
        event.preventDefault(); 
        aboutSection.scrollIntoView({behavior: "smooth"});
    });

    /////log in
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');

    let isAuthenticated = false;

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'block';
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        isAuthenticated = false;
        loginContainer.style.display = 'none';
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        toggleAdminFeatures();
    
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple role-based authentication (replace with real logic)
        if (username === 'admin' && password === 'adminpass') {
            isAuthenticated = true;
            loginContainer.style.display = 'none';
            loginLink.style.display = 'none';
            logoutLink.style.display = 'block';
            toggleAdminFeatures();
            fetchReservations()
        } else {
            alert('Invalid username or password');
        }
    });

    function toggleAdminFeatures() {
        addMenuForm.style.display = isAuthenticated ? 'block' : 'none';
        document.querySelectorAll('.menu-item button').forEach(button => {
            button.style.display = isAuthenticated ? 'inline-block' : 'none';
        });
        
    }
    
    ////////MENU

    // menu nav

    const menuLink = document.getElementById('menu-link');
    const menuSection = document.getElementById('menu-container');

    menuLink.addEventListener('click', (e) => {
        e.preventDefault();
        menuSection.scrollIntoView({behavior: "smooth"});
    });
    
    // Add to menu
    const addMenuForm = document.getElementById('add-menu-form');

    if (!isAuthenticated) {
        addMenuForm.style.display = 'none';
    }
    
    addMenuForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('You must be logged in to add menu items.');
            return;
        }

        const name = document.getElementById('new-item-name').value;
        const category = document.getElementById('new-item-category').value;
        const price = document.getElementById('new-item-price').value;

        fetch('http://localhost:3000/menu', {
            method: 'POST',
            headers: {'Content-Type': 'application/json', },
            body: JSON.stringify({ name, category, price }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Menu item added successfully!');
            addMenuForm.reset();
            fetchMenu(category);
        })
        .catch(error => {
            console.error('Add Menu Item Error:', error);
            alert('Failed to add menu item. Please try again.');
        });
        
    });

    
    // menu items i.e (breakfast, meals, dessert items)
    const menuItemsSection = document.getElementById('menu-items');
    const showBreakfast = document.getElementById('breakFastbtn');
    const showMeals = document.getElementById('mealsBtn');
    const showDesserts = document.getElementById('dessertBtn');
    

    function fetchMenu(category) {
        fetch('http://localhost:3000/menu')
        .then(response => response.json())
        .then(data => {
            const filteredMenu = data.filter(item => item.category === category);
            displayMenu(filteredMenu);
        })
        .catch(error => {
            console.log('Fetch Error:', error);
        });
    }

    function displayMenu(items) {
        menuItemsSection.innerHTML = '';
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';

            const itemName = document.createElement('h3');
            itemName.textContent = item.name;

            const itemPrice = document.createElement('p');
            itemPrice.textContent = item.price;

            // Create edit and delete buttons
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editMenuItem(item));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteMenuItem(item.id));

            // Hide buttons if not authenticated
            if (!isAuthenticated) {
                editButton.style.display = 'none';
                deleteButton.style.display = 'none';
            }

            itemDiv.appendChild(itemName);
            itemDiv.appendChild(itemPrice);
            itemDiv.appendChild(editButton);
            itemDiv.appendChild(deleteButton);
            categoryDiv.appendChild(itemDiv);


            
        });

        menuItemsSection.appendChild(categoryDiv);
    }

    function editMenuItem(item) {
        const newName = prompt("Enter new name:", item.name);
        const newPrice = prompt("Enter new price:", item.price);

        if (newName && newPrice) {
            fetch(`http://localhost:3000/menu/${item.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newName, price: newPrice }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Menu item updated:', data);
                alert('Menu item updated!');
                fetchMenu(item.category); 
            })
            .catch(error => {
                console.error('Update Error:', error);
                alert('Update failed. Please try again later.');
            });
        }
    }

    function deleteMenuItem(id) {
        fetch(`http://localhost:3000/menu/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log('Menu item deleted:', data);
            alert('Menu item deleted!');
            fetchMenu(document.querySelector('.menu-category').id); 
        })
        .catch(error => {
            console.error('Delete Error:', error);
            alert('Delete failed. Please try again later.');
        });    
            
    };

    showBreakfast.addEventListener('click', () => fetchMenu('breakfast'));
    showMeals.addEventListener('click', () => fetchMenu('meals'));
    showDesserts.addEventListener('click', () => fetchMenu('dessert'));

    // RESERVATIONS
    const reservationsLink = document.getElementById('reservations-link');
    const reservationsSection = document.getElementById('reservations-container');    
    const reservationsList = document.getElementById('reservations-list');
    const reservationsForm = document.getElementById('form');

    reservationsLink.addEventListener('click', (e) => {
        e.preventDefault();
        reservationsSection.scrollIntoView({behavior: "smooth"});
    });
    reservationsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = reservationsForm.querySelector('input[type="text"]').value;
        const phoneNumber = reservationsForm.querySelector('input[type="number"]').value;
        const date = reservationsForm.querySelector('input[type="date"]').value;
        const time = reservationsForm.querySelector('input[type="time"]').value;
        const people = reservationsForm.querySelector('input[type="number"]').value;

        fetch('http://localhost:3000/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, phoneNumber, date, time, people }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Reservation successful!');
            reservationsForm.reset();
            fetchReservations();
        })
        .catch(error => {
            console.error('Reservation Error:', error);
            alert('Reservation failed. Please try again later.');
        });
    });

    function fetchReservations() {
        fetch('http://localhost:3000/reservations')
        .then(response => response.json())
        .then(data => {
            displayReservations(data);
        })
        .catch(error => {
            console.log('Fetch Error:', error);
        });
    }


    function displayReservations(reservations) {
        reservationsList.innerHTML = '';
        reservations.forEach(reservation => {
            const reservationDiv = document.createElement('div');
            reservationDiv.className = 'reservation-item';

            const reservationDetails = document.createElement('p');
            reservationDetails.textContent = `Name: ${reservation.name}, Phone: ${reservation.phoneNumber}, Date: ${reservation.date}, Time: ${reservation.time}, People: ${reservation.people}`;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editReservation(reservation));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteReservation(reservation.id));

            reservationDiv.appendChild(reservationDetails);
            reservationDiv.appendChild(editButton);
            reservationDiv.appendChild(deleteButton);

            reservationsList.appendChild(reservationDiv);

        });
    }

    function editReservation(reservation) {
        const newName = prompt('Enter new name:', reservation.name);
        const newPhoneNumber = prompt('Enter new phone number:', reservation.phoneNumber);
        const newDate = prompt('Enter new date:', reservation.date);
        const newTime = prompt('Enter new time:', reservation.time);
        const newPeople = prompt('Enter new number of people:', reservation.people);

        fetch(`http://localhost:3000/reservations/${reservation.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.parse({ name: newName, phoneNumber: newPhoneNumber, date: newDate, time: newTime, people: newPeople }),
        })
        .then(response => response.json())
        .then(data => {
            alert('Reservation updated successfully!');
            fetchReservations();
        })
        .catch(error => {
            console.error('Edit Reservation Error:', error);
            alert('Failed to edit reservation. Please try again later.');
        });
    }

    function deleteReservation(reservationId) {
        fetch(`http://localhost:3000/reservations/${reservationId}`, {
            method: 'DELETE',
        })
        .then(() => {
            alert('Reservation deleted successfully!');
            fetchReservations();
        })
        .catch(error => {
            console.error('Delete Reservation Error:', error);
            alert('Failed to delete reservation. Please try again later.');
        });
    }
});
