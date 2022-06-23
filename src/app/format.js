export const formatDate = (dateStr) => {
  if(dateStr.match(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/)){
    const date = new Date(dateStr) // year-month-day
    const year = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date);
    const day = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
    const monthUpperCase = month.charAt(0).toUpperCase() + month.slice(1);
    return `${parseInt(day)} ${monthUpperCase.substr(0,3)}. ${year.toString().substr(2,4)}`
  } else {
    console.log(dateStr)
    return ''
  }
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}