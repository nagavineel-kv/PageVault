// This function will convert the createdAt to this format: "June 2025"
export function formatMemberSince(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", {month: "short"});
    const year = date.getFullYear();
    return `${month} ${year}`;
}
// This function will convert the createdAt to this format: "June 13 2025"
export function formatPublishDate(dateString) {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", {month: "long"});
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day} ${year}`;
}