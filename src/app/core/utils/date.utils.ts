export function formatDateToMMDDYYYY(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
}

export function formatTimeToHHMM(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function toCambodiaDate(dateString: string, isEndOfDay = false): Date {
    const date = new Date(dateString);
    const utcOffset =  7 * 60; // UTC+7 offset in minutes
    const localDate =  new Date(date.getTime() + utcOffset * 60 * 1000);

    if(isEndOfDay){
        localDate.setHours(23, 59, 59, 999); // End the day
    }else{
        localDate.setHours(0,0,0,0) // Start the day
    }
    return localDate;

}