export const socket = io('http://localhost:3000');

export function emit(event, args) {
    return new Promise(resolve => socket.emit(event, args, resolve));
}
