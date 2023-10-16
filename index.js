const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); 
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const polls = [
    {
        id: 1,
        question: 'Which is your favorite captain?',
        options: [
            { name: 'Dhoni'},
            { name: 'Kohli'},
            { name: 'Rohit'}
        ],
        votes: [0, 0, 0]
    }
];

    io.on('connection', (socket) => {
        console.log('A user connected');
    
        socket.emit('polls', polls);
    
        socket.on('vote', (pollId, optionIndex) => {
            if (pollId < 0 || pollId >= polls.length) {
                return; 
            }
        
            if (optionIndex < 0 || optionIndex >= polls[pollId].options.length) {
                return;
            }
        
            // Simulate a simple prevention of duplicate votes (you should use proper user tracking)
            if (!socket.voted) {
                socket.voted = true;
                polls[pollId].votes[optionIndex]++;
                io.emit('polls', polls);
            }
        });
    
        socket.on('create-poll', (question, options) => {
            console.log(`Received question: ${question}`);
            console.log(`Received options: ${options}`);
            
            // Ensure that the question and options are not empty
            if (question && options) {
                // Process the received data and create a new poll
                const newPoll = {
                    id: polls.length + 1,
                    question,
                    options: options.split(',').map(optionStr => {
                        const [name] = optionStr.split('|').map(part => part.trim());
                        return { name};
                    }),
                    votes: Array(options.split(',').length).fill(0),
                    
                };
                polls.push(newPoll);
                io.emit('polls', polls);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    
  
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    server.listen(3000, () => {
        console.log('Server is running on http://localhost:3000');
    });
