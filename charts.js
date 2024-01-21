import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
        import { getFirestore, collection, query, orderBy, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
        
        
        const firebaseConfig = {
            apiKey: "AIzaSyB-lT02c3Ry90CYf9x_Qibys9PEhzwy2mU",
            authDomain: "signbuddy-d3d91.firebaseapp.com",
            projectId: "signbuddy-d3d91",
            storageBucket: "signbuddy-d3d91.appspot.com", 
            messagingSenderId: "820561191348",
            appId: "1:820561191348:web:925ea006b96f2f164952e1"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const db = getFirestore(app);

        // Get the user data from Firestore
        const userDataRef = collection(db, 'userData');
        const userCountChartCanvas = document.getElementById('userCountChart').getContext('2d');
        const dateRangeSelect = document.getElementById('dateRange');

        // Variable to store the current chart instance
        let userCountChart;

        async function getUserDataAndCreateChart(days) {
        const userDataSnapshot = await getDocs(query(userDataRef, orderBy('accountCreated')));
        const userData = userDataSnapshot.docs.map(doc => doc.data());

        const userCountPerDay = {};
        const today = new Date();

        userData.forEach(user => {
            const date = user.accountCreated.toDate();
            const dateDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));

            if (dateDiff <= days) {
                const dateString = date.toLocaleDateString();
                userCountPerDay[dateString] = (userCountPerDay[dateString] || 0) + 1;
            }
        });

        // Fill in missing dates with 0 user count
        for (let i = 0; i < days; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateString = date.toLocaleDateString();
            if (!userCountPerDay[dateString]) {
                userCountPerDay[dateString] = 0;
            }
        }

        const dateLabels = Object.keys(userCountPerDay);
        const userCountData = dateLabels.map(date => userCountPerDay[date]);

        // Destroy the previous chart instance if it exists
        if (userCountChart) {
            userCountChart.destroy();
        }

        userCountChart = new Chart(userCountChartCanvas, {
            type: 'line',
            data: {
                labels: dateLabels.map(date => new Date(date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'User Count',
                    data: userCountData,
                    fill: false,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 1)',
                }]
            },
            options: {

                scales: {
                    x: {
                        border: {
                            color: 'red'
                        },
                        title: {
                            display: true,
                            text: 'Date',
                            color: 'red',
                        }
                    },
                    y: {
                        
                        title: {
                            display: true,
                            text: ' User Count',
                            color: 'blue',
                        },
                        stepSize: 1 
                        
                    }
                }
            }
        });
    }

        dateRangeSelect.addEventListener('change', function () {
            const selectedDays = parseInt(this.value);
            getUserDataAndCreateChart(selectedDays);
        });

        // Initial chart creation with default date range (e.g., last 7 days)
        getUserDataAndCreateChart(7);





        



        // Function to fetch user data from Firestore
        const getClassificationData = async () => {
            const userDataRef = collection(db, "userData");
            const userDataQuery = await getDocs(userDataRef);

            return userDataQuery.docs.map(doc => ({
                classification: doc.data().classification,
                language: doc.data().language,
            }));
        };

        const renderClassificationBarChart = async (languageFilter) => {
            const userData = await getClassificationData();


            const filteredData = (languageFilter === 'All') ? userData : userData.filter(entry => entry.language === languageFilter);


            const speechImpairedData = filteredData.filter(entry => entry.classification === "Speech Impaired");
            const nonDisabledData = filteredData.filter(entry => entry.classification === "Non-Disabled");

            const ctx = document.getElementById("userClassificationChart").getContext("2d");

            
            if (window.myClassifyChart) {
                window.myClassifyChart.destroy();
            }

            window.myClassifyChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Speech Impaired', 'Non-Disabled'],
                    datasets: [{
                        label: 'Speech Impaired',
                        data: [speechImpairedData.length, 0],
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                    }, {
                        label: 'Non-Disabled',
                        data: [0, nonDisabledData.length],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                    }]
                },
                options: {
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: ' User Count',
                                color: 'red'
                            },
                            stepSize: 1,
                        },
                        y: {
                            stacked: true,
                            border: {
                                color: 'red'
                            },
                            ticks: {
                                color: 'blue',
                            },
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => `Users: ${context.raw}`,
                            },
                        },
                    },
                    indexAxis: 'y'
                }
            });
        };


        document.getElementById("languageFilter").addEventListener("change", function() {
            const selectedLanguage = this.value;
            renderClassificationBarChart(selectedLanguage);
        });


        renderClassificationBarChart('All');





        


        // Function to fetch assessment result data from Firestore with language filter
        const getAssessmentResultData = async (languageFilter, classificationFilter) => {
            const userDataRef = collection(db, "userData");
            const userDataQuery = await getDocs(userDataRef);

            return userDataQuery.docs.map(doc => ({
                assessmentResult: doc.data().assessmentResult,
                language: doc.data().language,
                classification: doc.data().classification,
            })).filter(entry => 
                (languageFilter === 'All Language' || entry.language === languageFilter) &&
                (classificationFilter === 'All Classification' || entry.classification === classificationFilter)
            );
        };

        // Function to render the bar chart for assessment results with language filter
        const renderAssessmentResultBarChart = async (languageFilter, classificationFilter) => {
            const userData = await getAssessmentResultData(languageFilter, classificationFilter);

            // Count occurrences of each score (1 through 8)
            const scoreCounts = Array.from({ length: 8 }, () => 0);
            userData.forEach(entry => {
                const score = entry.assessmentResult;
                if (score >= 1 && score <= 8) {
                    scoreCounts[score - 1]++;
                }
            });

            const ctx = document.getElementById("filteredChart").getContext("2d");
            // Check if a chart instance already exists and destroy it
            if (window.myFilteredChart) {
                window.myFilteredChart.destroy();
            }

            window.myFilteredChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
                    datasets: [{
                        label: 'Assessment Results',
                        data: scoreCounts,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)', // Red
                            'rgba(255, 159, 64, 0.7)', // Orange
                            'rgba(255, 205, 86, 0.7)', // Yellow
                            'rgba(75, 192, 192, 0.7)', // Green
                            'rgba(54, 162, 235, 0.7)', // Blue
                            'rgba(153, 102, 255, 0.7)', // Purple
                            'rgba(220, 57, 18, 0.7)', // Gray
                            'rgba(170, 170, 17, 0.7)' // Lime
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(255, 159, 64, 1)',
                            'rgba(255, 205, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(220, 57, 18, 1)',
                            'rgba(170, 170, 17, 1)'
                        ],
                        borderWidth: 2,
                    }]
                },
                options: {
                    scales: {
                        x: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Assessment Scores',
                                color: 'red'
                            },
                            border: {
                                color: 'red'
                            },
                            ticks: {
                                color: 'blue',
                            },
                        },
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: ' User Count',
                                color: 'blue'
                            },
                            ticks: {
                            precision: 0,
                            callback: function (value) { return value.toFixed(0); }
                        },
                            stepSize: 1
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                title: (context) => `Assessment Score: ${context[0].label}`,
                                label: (context) => `Total Users: ${context.raw}`,
                            },
                        },
                    },
                },
            });
        };


        document.getElementById("languageAssessmentFilter").addEventListener("change", function () {
            const selectedLanguage = this.value;
            const selectedClassification = document.getElementById("classificationAssessmentFilter").value;
            renderAssessmentResultBarChart(selectedLanguage, selectedClassification);
        });

        document.getElementById("classificationAssessmentFilter").addEventListener("change", function () {
            const selectedClassification = this.value;
            const selectedLanguage = document.getElementById("languageAssessmentFilter").value;
            renderAssessmentResultBarChart(selectedLanguage, selectedClassification);
        });

        renderAssessmentResultBarChart('All Language', 'All Classification');
        

        // Function to fetch data based on the selected language
        const fetchDataForAllUsers = () => {
            const selectedLanguage = document.getElementById('language').value;
            fetchData(selectedLanguage);
            };

            // Function to fetch data and update the chart
            const fetchData = async (selectedLanguage) => {
            const userDataCollection = collection(db, "userData");
            const userDocsSnapshot = await getDocs(userDataCollection);

            const fetchPromises = [];
            
            userDocsSnapshot.forEach((userDoc) => {
                const userId = userDoc.id;
                const docRef = doc(db, "userData", userId, selectedLanguage, "interact");
                const promise = getDoc(docRef)
                .then((docSnap) => {
                    const interactData = docSnap.data();
                    return interactData;
                })
                .catch((error) => {
                    console.error(`Error getting document for user ${userId}:`, error);
                    return null;
                });

                fetchPromises.push(promise);
            });

            // Wait for all data to be fetched
            const allInteractData = await Promise.all(fetchPromises);

            // Calculate averages
            const totalInteractData = allInteractData.reduce((total, interactData) => {
                if (interactData) {
                total.createInteract += interactData.createInteract || 0;
                total.findInteract += interactData.findInteract || 0;
                total.lessonInteract += interactData.lessonInteract || 0;
                total.signAlphaInteract += interactData.signAlphaInteract || 0;
                total.spellInteract += interactData.spellInteract || 0;
                }
                return total;
            }, {
                createInteract: 0,
                findInteract: 0,
                lessonInteract: 0,
                signAlphaInteract: 0,
                spellInteract: 0
            });

            const numUsers = userDocsSnapshot.size;
            totalInteractData.createInteract /= numUsers;
            totalInteractData.findInteract /= numUsers;
            totalInteractData.lessonInteract /= numUsers;
            totalInteractData.signAlphaInteract /= numUsers;
            totalInteractData.spellInteract /= numUsers;

            // Create the doughnut chart with average values
            createDonutChart(totalInteractData);
            };

            function createDonutChart(interactData) {
                const canvas = document.getElementById('donutChart');
                const ctx = canvas.getContext("2d");

                // Check if there is an existing chart instance
                if (canvas.chart) {
                    canvas.chart.destroy(); 
                }

                canvas.chart = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: ["Word Fusion", "Find Sign", "Lessons", "Sign Alphabet", "Finger Spelling"],
                        datasets: [{
                        label: ' Average Interaction',
                            data: [
                                interactData.createInteract || 0,
                                interactData.findInteract || 0,
                                interactData.lessonInteract || 0,
                                interactData.signAlphaInteract || 0,
                                interactData.spellInteract || 0,
                            ],
                            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9C27B0"],
                            borderRadius: 10,
                            borderWidth: 3,
                            hoverOffset: 10
                        }],
                    },
                    options: {
                        aspectRatio: 2,
                        cutout: 45,
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'right',
                            },
                            
                        },
                    },
                });
            }

            document.getElementById('language').addEventListener('change', fetchDataForAllUsers);


            fetchDataForAllUsers();
        





