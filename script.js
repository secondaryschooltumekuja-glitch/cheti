// Student data storage
let students = [];
let currentView = 'registration';
const API_URL = '/api/students';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadStudentsFromDatabase();
    
    // Form submission handler
    document.getElementById('studentForm').addEventListener('submit', handleFormSubmit);
    
    // Photo preview handler
    document.getElementById('studentPhoto').addEventListener('change', handlePhotoPreview);
    
    // Search functionality
    document.getElementById('searchStudent').addEventListener('input', handleSearch);
});

// Load students from database
async function loadStudentsFromDatabase() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            students = await response.json();
            updateStudentsList();
        } else {
            console.error('Failed to load students from database');
            // Fallback to localStorage
            loadStudentsFromLocalStorage();
        }
    } catch (error) {
        console.error('Error loading students:', error);
        // Fallback to localStorage
        loadStudentsFromLocalStorage();
    }
}

// Fallback: Load students from localStorage
function loadStudentsFromLocalStorage() {
    const saved = localStorage.getItem('students');
    if (saved) {
        students = JSON.parse(saved);
        updateStudentsList();
    }
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    currentView = sectionName;
    
    // Update content based on section
    if (sectionName === 'students') {
        updateStudentsList();
    }
}

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const student = {
        student_name: formData.get('studentName') || document.getElementById('studentName').value,
        course: formData.get('course') || document.getElementById('course').value,
        teacher_name: formData.get('teacherName') || document.getElementById('teacherName').value,
        photo: null
    };
    
    // Handle photo
    const photoFile = document.getElementById('studentPhoto').files[0];
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            student.photo = e.target.result;
            saveStudentToDatabase(student);
        };
        reader.readAsDataURL(photoFile);
    } else {
        saveStudentToDatabase(student);
    }
}

// Save student to database
async function saveStudentToDatabase(student) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(student)
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Show success message
                showSuccessMessage('Student registered successfully!');
                
                // Clear form
                document.getElementById('studentForm').reset();
                document.getElementById('photoPreview').innerHTML = '';
                
                // Reload students list
                await loadStudentsFromDatabase();
            } else {
                throw new Error(result.error || 'Failed to save student');
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error saving student:', error);
        // Fallback to localStorage
        saveStudentToLocalStorage(student);
    }
}

// Fallback: Save student to localStorage
function saveStudentToLocalStorage(student) {
    student.id = Date.now().toString();
    student.registration_date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    
    showSuccessMessage('Student registered successfully!');
    document.getElementById('studentForm').reset();
    document.getElementById('photoPreview').innerHTML = '';
    updateStudentsList();
}

// Show success message
function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    
    const formContainer = document.querySelector('.form-container');
    formContainer.insertBefore(successDiv, formContainer.firstChild);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Handle photo preview
function handlePhotoPreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('photoPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// Load students from localStorage
function loadStudents() {
    const saved = localStorage.getItem('students');
    if (saved) {
        students = JSON.parse(saved);
    }
}

// Update students list display
function updateStudentsList() {
    const container = document.getElementById('studentsList');
    
    if (students.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No students registered</h3>
                <p>Start registering students to see them here</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = students.map(student => `
        <div class="student-card" data-student-id="${student.id}">
            ${student.photo ? `<img src="${student.photo}" alt="${student.student_name || student.name}">` : '<div class="no-photo"><i class="fas fa-user"></i></div>'}
            <h3>${student.student_name || student.name}</h3>
            <p><strong>Course:</strong> ${student.course}</p>
            <p><strong>Instructor:</strong> ${student.teacher_name || student.teacher}</p>
            <p><strong>Date:</strong> ${formatDate(student.registration_date || student.registrationDate)}</p>
            <div class="student-actions">
                <button class="action-btn view-btn" onclick="viewCertificate('${student.id}')">
                    <i class="fas fa-eye"></i> View Certificate
                </button>
                <button class="action-btn print-btn" onclick="printCertificate('${student.id}')">
                    <i class="fas fa-print"></i> Print
                </button>
                <button class="action-btn delete-btn" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Search functionality
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const studentCards = document.querySelectorAll('.student-card');
    
    studentCards.forEach(card => {
        const studentName = card.querySelector('h3').textContent.toLowerCase();
        const course = card.querySelector('p').textContent.toLowerCase();
        
        if (studentName.includes(searchTerm) || course.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// View certificate
function viewCertificate(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Switch to certificates section
    showCertificatesSection();
    
    // Generate certificate
    generateCertificate(student);
}

// Generate certificate
function generateCertificate(student) {
    const template = document.getElementById('certificateTemplate');
    const clone = template.cloneNode(true);
    clone.id = `certificate-${student.id}`;
    clone.style.display = 'block';
    
    // Fill in student data
    const studentName = student.student_name || student.name;
    const teacherName = student.teacher_name || student.teacher;
    const registrationDate = student.registration_date || student.registrationDate;
    
    clone.querySelector('.student-name').textContent = studentName.toUpperCase();
    clone.querySelector('.course-name').textContent = student.course.toUpperCase();
    clone.querySelector('.teacher-name').textContent = teacherName;
    clone.querySelector('.date-value').textContent = formatDate(registrationDate);
    
    // Set photo
    if (student.photo) {
        clone.querySelector('.student-photo').src = student.photo;
    } else {
        clone.querySelector('.student-photo-container').innerHTML = '<i class="fas fa-user" style="font-size: 3rem; color: #667eea; margin-top: 35px;"></i>';
    }
    
    // Update certificate view
    const certificateView = document.getElementById('certificateView');
    certificateView.innerHTML = '';
    certificateView.appendChild(clone);
    
    // Add print button
    const printButton = document.createElement('div');
    printButton.style.textAlign = 'center';
    printButton.style.marginTop = '20px';
    printButton.innerHTML = `
        <button class="action-btn print-btn" onclick="printCertificate('${student.id}')" style="display: inline-flex; padding: 15px 30px; font-size: 16px;">
            <i class="fas fa-print"></i> Print Certificate
        </button>
    `;
    certificateView.appendChild(printButton);
}

// Show certificates section
function showCertificatesSection() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show certificates section
    document.getElementById('certificates').classList.add('active');
    
    // Add active class to certificates button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.textContent.includes('Vyeti')) {
            btn.classList.add('active');
        }
    });
}

// Print individual certificate
function printCertificate(studentId) {
    const student = students.find(s => s.id == studentId);
    if (!student) return;
    
    // Create a temporary certificate for printing
    const tempCertificate = document.createElement('div');
    tempCertificate.innerHTML = document.getElementById('certificateTemplate').innerHTML;
    
    // Fill in student data
    const studentName = student.student_name || student.name;
    const teacherName = student.teacher_name || student.teacher;
    const registrationDate = student.registration_date || student.registrationDate;
    
    tempCertificate.querySelector('.student-name').textContent = studentName.toUpperCase();
    tempCertificate.querySelector('.course-name').textContent = student.course.toUpperCase();
    tempCertificate.querySelector('.teacher-name').textContent = teacherName;
    tempCertificate.querySelector('.date-value').textContent = formatDate(registrationDate);
    
    // Set photo
    if (student.photo) {
        tempCertificate.querySelector('.student-photo').src = student.photo;
    } else {
        tempCertificate.querySelector('.student-photo-container').innerHTML = '<i class="fas fa-user" style="font-size: 3rem; color: #667eea; margin-top: 35px;"></i>';
    }
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Certificate - ${studentName}</title>
            <link rel="stylesheet" href="style.css">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
            <style>
                body { margin: 0; padding: 20px; background: white; }
                .certificate-template { display: block !important; }
            </style>
        </head>
        <body>
            <div class="certificate-template">
                ${tempCertificate.innerHTML}
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };
}

// Print all certificates
function printAllCertificates() {
    if (students.length === 0) {
        alert('No students to print!');
        return;
    }
    
    if (!confirm(`Are you sure you want to print all ${students.length} certificates?`)) {
        return;
    }
    
    // Create print window with all certificates
    const printWindow = window.open('', '_blank');
    const certificatesHTML = students.map(student => {
        const tempCertificate = document.createElement('div');
        tempCertificate.innerHTML = document.getElementById('certificateTemplate').innerHTML;
        
        // Fill in student data
        const studentName = student.student_name || student.name;
        const teacherName = student.teacher_name || student.teacher;
        const registrationDate = student.registration_date || student.registrationDate;
        
        tempCertificate.querySelector('.student-name').textContent = studentName.toUpperCase();
        tempCertificate.querySelector('.course-name').textContent = student.course.toUpperCase();
        tempCertificate.querySelector('.teacher-name').textContent = teacherName;
        tempCertificate.querySelector('.date-value').textContent = formatDate(registrationDate);
        
        // Set photo
        if (student.photo) {
            tempCertificate.querySelector('.student-photo').src = student.photo;
        } else {
            tempCertificate.querySelector('.student-photo-container').innerHTML = '<i class="fas fa-user" style="font-size: 3rem; color: #667eea; margin-top: 35px;"></i>';
        }
        
        return `<div class="certificate-template" style="page-break-after: always;">${tempCertificate.innerHTML}</div>`;
    }).join('');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>All Certificates - TUMEKUJA Computer Training</title>
            <link rel="stylesheet" href="style.css">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
            <style>
                body { margin: 0; padding: 0; background: white; }
                .certificate-template { display: block !important; margin-bottom: 20px; }
                @media print {
                    .certificate-template:not(:last-child) { page-break-after: always; }
                }
            </style>
        </head>
        <body>
            ${certificatesHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 1000);
    };
}

// Delete student
async function deleteStudent(studentId) {
    const student = students.find(s => s.id == studentId);
    if (!student) return;
    
    const studentName = student.student_name || student.name;
    if (confirm(`Are you sure you want to delete ${studentName}?`)) {
        try {
            const response = await fetch(`${API_URL}?id=${studentId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    // Remove from local array
                    students = students.filter(s => s.id != studentId);
                    updateStudentsList();
                    showSuccessMessage('Student deleted successfully!');
                } else {
                    throw new Error(result.error || 'Failed to delete student');
                }
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            // Fallback to localStorage deletion
            deleteStudentFromLocalStorage(studentId, studentName);
        }
    }
}

// Fallback: Delete student from localStorage
function deleteStudentFromLocalStorage(studentId, studentName) {
    students = students.filter(s => s.id !== studentId);
    localStorage.setItem('students', JSON.stringify(students));
    updateStudentsList();
    showSuccessMessage('Student deleted successfully!');
}

// Export data functionality
function exportData() {
    const dataStr = JSON.stringify(students, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `wanafunzi_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Import data functionality
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedStudents = JSON.parse(e.target.result);
            if (Array.isArray(importedStudents)) {
                students = students.concat(importedStudents);
                localStorage.setItem('students', JSON.stringify(students));
                updateStudentsList();
                showSuccessMessage('Data imehamishwa kikamilifu!');
            } else {
                alert('Faili si sahihi. Tafadhali chagua faili sahihi la JSON.');
            }
        } catch (error) {
            alert('Hitilafu katika kusoma faili. Hakikisha faili ni la JSON.');
        }
    };
    reader.readAsText(file);
}

// Clear all data
function clearAllData() {
    if (confirm('ONYO: Hii itafuta data yote ya wanafunzi. Una uhakika?')) {
        if (confirm('Hii haiwezi kurekebishwa. Endelea?')) {
            students = [];
            localStorage.removeItem('students');
            updateStudentsList();
            showSuccessMessage('Data yote imefutwa!');
        }
    }
}

// Utility function to format date in Swahili
function formatSwahiliDate(date) {
    const months = [
        'Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni',
        'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'
    ];
    
    const d = new Date(date);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl+P for print
    if (event.ctrlKey && event.key === 'p' && currentView === 'certificates') {
        event.preventDefault();
        const visibleCertificate = document.querySelector('#certificateView .certificate-template[style*="block"]');
        if (visibleCertificate) {
            const studentId = visibleCertificate.id.replace('certificate-', '');
            printCertificate(studentId);
        }
    }
    
    // Ctrl+S for save (add new student)
    if (event.ctrlKey && event.key === 's' && currentView === 'registration') {
        event.preventDefault();
        document.getElementById('studentForm').dispatchEvent(new Event('submit'));
    }
});
