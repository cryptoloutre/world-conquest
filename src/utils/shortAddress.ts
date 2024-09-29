export function shortAddress(address: string) {
    const shortAddress = address.slice(0, 4) + "..." + address.slice(-4)
    return shortAddress
}