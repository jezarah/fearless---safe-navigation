import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react'
import { FaLocationArrow, FaTimes } from 'react-icons/fa'

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { useRef, useState } from 'react'

const center = { lat: 49.251934, lng: -123.126666 }

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [directionsResponse, setDirectionsResponse] = useState(null)
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  /** @type React.MutableRefObject<HTMLInputElement> */
  const originRef = useRef()
  /** @type React.MutableRefObject<HTMLInputElement> */
  const destinationRef = useRef()

  if (!isLoaded) {
    return <SkeletonText />
  }

  async function calculateRoute() {
    if (originRef.current.value === '' || destinationRef.current.value === '') {
      return
    }
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      // eslint-disable-next-line no-undef
      travelMode: google.maps.TravelMode.WALKING,
      provideRouteAlternatives: true,
    })
    setDirectionsResponse(results)
    setRoutes(results.routes);
    setDistance(results.routes[0].legs[0].distance.text)
    setDuration(results.routes[0].legs[0].duration.text)
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setRoutes([]);
    setRouteIndex(0);
    setDistance('')
    setDuration('')
    originRef.current.value = ''
    destinationRef.current.value = ''
  }

  const handleButtonClick = (index) => {
    setRouteIndex(index);
  };

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={13}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} visible={false} />
          {directionsResponse && (
            <DirectionsRenderer 
              directions={directionsResponse} 
              routeIndex={routeIndex} />
          )}
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type='text' placeholder='Origin' ref={originRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type='text'
                placeholder='Destination'
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme='pink' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent='space-between'>
          <Text>Distance: {distance} </Text>
          <Text>Duration: {duration} </Text>
          <IconButton
            aria-label='center back'
            icon={<FaLocationArrow />}
            isRound
            onClick={() => {
              map.panTo(center)
              map.setZoom(15)
            }}
          />
        </HStack>
        
      {/* Available Routes */}
      <VStack spacing={4} mt={4} justifyContent='space-between'>
        {directionsResponse && (
          <>
            <Text fontSize="lg" fontWeight="bold" mt={4}>Available routes:</Text>
            {routes.map((route, index) => (
              <Button key={index} 
                width="auto" 
                height="auto" 
                justifyContent="flex-start" 
                textAlign="left" 
                bgColor="transparent" 
                _hover={{ bgColor: 'gray.100' }}
                onClick={() => handleButtonClick(index)}>
                <VStack>
                  <div>Route {index + 1}: {route.summary}</div>
                  <div>Distance: {route.legs[0].distance.text}</div>
                  <div>Duration: {route.legs[0].duration.text}</div>
                </VStack>
              </Button>
            ))}

            <DirectionsRenderer directions={directionsResponse} routeIndex={routeIndex} />
          </>
        )}
      </VStack>
      </Box>
    </Flex>
  )
}

export default App
