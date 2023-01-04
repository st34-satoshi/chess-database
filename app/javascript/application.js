// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
import "bootstrap"

import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

console.log('hello application js');

$(function() {
    console.log("Hello Rails7!");
})