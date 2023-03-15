import "application"
import { SetOnChange } from "./form"

$(function() {
    SetOnChange()
})
document.addEventListener('turbo:render', function() {
    SetOnChange()
});