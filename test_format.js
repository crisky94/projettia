// Test the formatEstimatedTime function
const formatEstimatedTime = (hours) => {
    if (!hours) return null;
    if (hours < 1) {
        // Convert to minutes and handle decimal precision
        const minutes = Math.round(hours * 60);
        return `${minutes}min`;
    }
    if (hours >= 8) return `${Math.round(hours / 8)}d`;
    // Show hours as they are
    return `${hours}h`;
};

console.log('Testing formatEstimatedTime:');
console.log('0.5 hours =', formatEstimatedTime(0.5));
console.log('0.83 hours =', formatEstimatedTime(0.83));
console.log('0.833 hours =', formatEstimatedTime(0.833));
console.log('1 hour =', formatEstimatedTime(1));
console.log('1.5 hours =', formatEstimatedTime(1.5));
console.log('0.25 hours =', formatEstimatedTime(0.25));

console.log('\nTesting specific values:');
console.log('50min = 0.83333 hours =', formatEstimatedTime(50 / 60));
console.log('30min = 0.5 hours =', formatEstimatedTime(30 / 60));
console.log('45min = 0.75 hours =', formatEstimatedTime(45 / 60));
