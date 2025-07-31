import React from 'react'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import AiTools from '../components/AiTools'
import Testimonial from '../components/Testimonial'
import Plan from '../components/Plan'
import Footer from '../components/Footer'

const Home = () => {
  return (
      <>
      <NavBar></NavBar>
      <Hero></Hero>
      <AiTools></AiTools>
      <Testimonial></Testimonial>
      <Plan></Plan>
      <Footer></Footer>
      </>
  )
}

export default Home;