let money = 0;

export function initializeMoney() {
    const prevMoney = localStorage.getItem("money");
    if (prevMoney !== null) {
        money = parseInt(prevMoney, 10); 
    } else {
        money = 0;
    }
}

export function getMoney() {
    return money;
}

export function addMoney(amount) {
    money += amount;
    localStorage.setItem('money', money);
}