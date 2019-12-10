import React, {Component} from 'react';
import './App.css';
import axios from 'axios'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import {Helmet} from 'react-helmet'

const baseUrl = `https://solvenext.herokuapp.com`
const numRegex = /^[0-9]+$/

class App extends Component{
  constructor(props){
    super(props)
    this.state = {
      result: null,
      usersQuery: "",
      roundQuery: "",
      nopQuery: "",
      lbQuery: "",
      ubQuery: "",
      users: [""],
      tags: [],
      selectedTags: [],
    }
    axios.get(`${baseUrl}/tags`).then(response => this.setState({
      tags: response.data.map((tag, id) => 
        ({id, value: tag, label: tag})
      )
    }))
  }

  onUsersChange = event => this.setState({usersQuery : event.target.value })
  onRoundChange = event => event.target.value === '' || numRegex.test(event.target.value)?this.setState({roundQuery : event.target.value }):false
  onNOPChange = event => event.target.value === '' || numRegex.test(event.target.value)?this.setState({nopQuery : event.target.value }):false
  onLBChange = event => event.target.value === '' || numRegex.test(event.target.value)?this.setState({lbQuery : event.target.value }):false
  onUBChange = event => event.target.value === '' || numRegex.test(event.target.value)?this.setState({ubQuery : event.target.value }):false

  onTagListChange = selectedOptions => this.setState({selectedTags: selectedOptions})

  fetchResults = () => {
    let tagsQuery = ""
    let usersQuery = ""
    this.state.selectedTags.forEach(tag => tagsQuery += `${tag.label},`)
    this.state.users.forEach(user => {
      if(user.length)
        usersQuery += `${user},`
    })
    usersQuery = usersQuery.substr(0, usersQuery.length-1)
    const url = `${baseUrl}/get/?users=${usersQuery}&tags=${tagsQuery}&ROUND=${this.state.roundQuery}&nop=${this.state.nopQuery}&lowerBound=${this.state.lbQuery}&upperBound=${this.state.ubQuery}`
    const request = axios.get(url)
    return request.then(response => this.setState({result: response.data}))
  }

  onSearchSubmit = event => {
    this.fetchResults()
    event.preventDefault()
  }

  onAddButton = event => {
    const updatedUsers = [...this.state.users, ""]
    this.setState({users: updatedUsers})
    event.preventDefault()
  }
  
  onUserChange = (event, index) => {
    const newUsers = [...this.state.users]
    newUsers[index] = event.target.value
    this.setState({users: newUsers})
  }

  render(){
    let resultTable, invalidHandles;
    if(this.state.result)
      resultTable = 
          <div className = "results">
            <table id = "suggested-problems" style = {{textAlign: "center", width: "100%"}}>
              <tbody>
                <tr id = "header" style = {{fontWeight: "bold"}}>
                  <td>Index</td>
                  <td>Problem</td>
                  <td>Rating</td>
                  <td>Solved by</td>
                </tr>
                {this.state.result.problems.map(problem => 
                    <tr className = "result-row" key = {`${problem.contestId}${problem.index}`}>
                      <td>{`${problem.contestId}${problem.index}`}</td>
                      <td><a href = {`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`} style = {{color: "black"}}>{problem.name}</a></td>
                      <td>{problem.rating}</td>
                      <td>{problem.solved}</td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
    else  resultTable = <div>Enter the required queries and click Generate List to load</div>
    if(this.state.result && this.state.result.invalidHandles.length)
      invalidHandles = 
          <div className = "invalidHandles">
            Ignoring invalid user handles: {this.state.result.invalidHandles.join(", ")}
          </div>
    else  invalidHandles = <div></div>
    const colorStyles = {
      menu: (provided, state) => ({
        ...provided,
        width: '500px',
      }),
      control: styles => ({...styles, backgroundColor: 'black', width: '400px'}),
      option: (styles, {data, isDisabled, isFocused, isSelected}) => {
        return {
          ...styles,
          backgroundColor: isDisabled?null:isFocused?'#3264FF':'black',
          color: 'white'
        }
      },
    }
    return(
      <>
        <Helmet><title>SolveNext - Codeforces</title></Helmet>
        <Usersform users = {this.state.users} onChange = {this.onUserChange} onAddButton = {this.onAddButton}>Users: </Usersform>
        <div className = "form">
          <form onSubmit={this.onSearchSubmit}>
            <div className = "tags Checkbox List">
              Tags: <Select isSearchable = "true" isMulti = "true" components = {() => makeAnimated()} onChange = {this.onTagListChange} options = {this.state.tags} styles = {colorStyles} autosize = {true}/>
            </div>
            <Formfield name = "round" value = {this.state.roundQuery} onChange = {this.onRoundChange}>Base Round: </Formfield>
            <Formfield name = "nop" value = {this.state.nopQuery} onChange = {this.onNOPChange}>Number of problems: </Formfield>
            <Formfield name = "lowerBound" value = {this.state.lbQuery} onChange = {this.onLBChange}>Minimum Rating: </Formfield>
            <Formfield name = "upperBound" value = {this.state.ubQuery} onChange = {this.onUBChange}>Maximum Rating: </Formfield>
            <button className = "query" type = "submit"> Generate List </button>
          </form>
        </div>
        {invalidHandles}
        {resultTable}
      </>
    )
  }

}
         
const Formfield = ({name, value, onChange, children}) => 
  <div className = "formField">
    {children}
    <input type = "text" name = {name} value = {value} onChange = {onChange} />
  </div>

const Usersform = ({children, users, onChange, onAddButton}) => {
  let addButton
  if(users.length < 4)
    addButton = 
      <button className = "add" type = "submit"> + </button>
  else  addButton = <div></div> 
  return(
    <div className = "userForm">
      <form onSubmit = {onAddButton}>
        {children}
        {users.map((user, index) => (
          <input className = "userInput" key = {index} type = "text" name = {user} value = {user} onChange = {event => onChange(event,index)} />
        ))}
        {addButton}
      </form>
    </div>
  )
}

//<Formfield name = "users" value = {this.state.usersQuery} onChange = {this.onUsersChange}>Users: </Formfield>

export default App;
