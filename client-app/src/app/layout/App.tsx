import React, { Fragment, useEffect, useState } from 'react';
import { Container} from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import {v4 as uuid} from 'uuid';
import agent from '../API/agent';
import LoadingComponent from './LoadingComponent';

function App() {
  const [activities, setActivities] = useState<Activity []>([]);
  const [selectedActivity, setSelectedActivities] = useState<Activity | undefined>(undefined);
  const [editMode, setEditMode] = useState (false);
  const [loading, setLoading] = useState(true);
  const [submiting, setSubmiting] = useState(false);

  useEffect(() => {
    agent.Activities.list()
    .then(response => {
      let activities: Activity [] = [];
      response.forEach(activity => {
        activity.date = activity.date.split('T')[0];
        activities.push(activity);
      })
      setActivities(activities);
      setLoading(false);
    })
  }, [])

  function handleSelectActivity(id: string) {
    setSelectedActivities(activities.find(x => x.id === id))
  }

  function handleCancelSelectActivity()
  {
    setSelectedActivities(undefined);
  }

  function handleFormOpen(id? : string)
  {
    id ? handleSelectActivity(id) : handleCancelSelectActivity();
    setEditMode(true);
  }

  function handleFormClose(){
    setEditMode(false);
  }

  function handleCreateOrEditActivity(activity: Activity){
    setSubmiting(true);
    if(activity.id) {
      agent.Activities.update(activity).then(() => {
        setActivities([...activities.filter(x=> x.id !== activity.id), activity])
        setSelectedActivities(activity);
        setEditMode(false);
        setSubmiting(false);
      })
    } else {
      activity.id = uuid();
      agent.Activities.create(activity).then(() => {
      setActivities([...activities, activity]);
      setSelectedActivities(activity);
        setEditMode(false);
        setSubmiting(false);
      })
    }
  }

  function handleDeleteActivity(id: string) {
    setSubmiting(true);
    agent.Activities.delete(id).then(() => {
      setActivities([...activities.filter(x => x.id !== id)]);
      setSubmiting(false);
    })
  }

  if(loading)return <LoadingComponent content='Loading app'/>

  return (
    <>
      <NavBar openForm={handleFormOpen} />
      <Container style = {{marginTop: '7em'}}>
      <ActivityDashboard 
      activities= {activities}
      selectedActivity = {selectedActivity}
      selectActivity = {handleSelectActivity}
      cancelSelectActivity = {handleCancelSelectActivity}
      editMode = {editMode}
      openForm = {handleFormOpen}
      closeForm = {handleFormClose}
      createOrEdit = {handleCreateOrEditActivity}
      deleteActivity = {handleDeleteActivity}
      submitting = {submiting}
      />
      </Container>
    </>
  );
}

export default App;
