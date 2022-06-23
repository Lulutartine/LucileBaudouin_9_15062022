import {fireEvent, screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage";
import {ROUTES, ROUTES_PATH} from "../constants/routes";
import Router from "../app/Router";
import Bills from "../containers/Bills";
import userEvent from "@testing-library/user-event";
import firebase from "../__mocks__/firebase";
import DashboardUI from "../views/DashboardUI";
import Firestore from "../app/Firestore";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      jest.mock("../app/Firestore")
      Firestore.bills = () => ({bills, get: jest.fn().mockResolvedValue()})
      Object.defineProperty(window, "localStorage", {value: localStorageMock,})
      window.localStorage.setItem("user", JSON.stringify({type: "Employee",}))
      const pathname = ROUTES_PATH["Bills"]
      Object.defineProperty(window, "location", {value: {hash: pathname}})
      document.body.innerHTML = `<div id="root"></div>`
      Router()
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('when i click on the eye icon button', ()=> {
    test('then a modal should open', ()=> {
      const html = BillsUI({data: bills})
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({pathname})
      }
     const bill = new Bills({document, onNavigate, firestore: null, localStorage: window.localStorage})
     $.fn.modal = jest.fn()
     const button = screen.getAllByTestId('icon-eye')[0]
     const handleClickIconEye = jest.fn((e) => {
       e.preventDefault()
       bill.handleClickIconEye(button)
     })
     button.addEventListener('click', handleClickIconEye)
     fireEvent.click(button)
     expect(handleClickIconEye).toHaveBeenCalled()

   })
  })

  describe('when i click on the make new Bill Button', ()=> {
    test('a new bill modal should open', ()=> {
      Object.defineProperty(window, 'local storage', {value: localStorageMock})
      window.localStorage.setItem(
          'user', JSON.stringify({type: 'employee'})
      )
      const html = BillsUI({data : []})
      document.body.innerHTML = html
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bills = new Bills({
        document,
        onNavigate,
        firestore: null,
        localStorage: window.localStorage})
      const button = screen.getByTestId('btn-new-bill')
      const handleClickNewBill = jest.fn((e)=> bills.handleClickNewBill(e))
      button.click('click', handleClickNewBill)
      fireEvent.click(button)
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
  
//Integration test GET
describe('Given I am a user connected as Admin', () => {

  test('fetches bills from mock API GET', async () => {
    const getSpy = jest.spyOn(firebase, "get")
    const bills = await firebase.get()
    expect(getSpy).toHaveBeenCalledTimes(1)
    expect(bills.data.length).toBe(4)
  })

  test('fetches bills from an API and fails with 404 message error', async () => {
    firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404")))
    const html = BillsUI({error: 'Erreur 404'})
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy()
  })

  test('fetches messages from an API and fails with 500 message error', async() => {
    firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
    )
    const html = BillsUI({ error: "Erreur 500" })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy()
  })
})

})