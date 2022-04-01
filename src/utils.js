module.exports = {
    formatCookies: (list) => {
        const formatted = [];
        list.forEach(cookie => {
            formatted.push(`${cookie.name}=${cookie.value}`)
        });
        return formatted.join("; ")
    }
}