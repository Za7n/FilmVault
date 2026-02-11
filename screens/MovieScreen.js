import { View, Text, ScrollView, SafeAreaView, Pressable, Platform, Dimensions, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';
import { HeartIcon } from 'react-native-heroicons/solid';
import { styles, theme } from '../theme'; 
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Cast from '../components/cast';
import MovieList from '../components/movieList';
import Loading from '../components/loading';
import { fallbackMoviePoster, fetchMovieDetails, image500, fetchMovieCredits, fetchSimilarMovies } from '../api/moviedb';

var {width, height} = Dimensions.get('window');
const ios = Platform.OS == 'ios';
const topMargin = ios? '': ' mt-3';

export default function MovieScreen() {
    const {params: item} = useRoute();
    const [isFavourite, toggleFavourite] = useState(false);
    const navigation = useNavigation();
    const [cast, setCast] = useState();
    const [similarMovies, setSimilarMovies] = useState([]);
    const [loading, setLoading]= useState(false);
    const [movie, setMovie] = useState({});
    let movieName = 'Dune 2: Messiah';

    useEffect (() => {
        //call the movie details api
        // console.log('itemid: ', item.id);
        setLoading(true);
        getMovieDetails(item.id);
        getMovieCredits(item.id);
        getSimilarMovies(item.id)
    }, [item])

    const getMovieDetails = async id => {
        const data = await fetchMovieDetails(id);
        // console.log('got movie details: ', data);
        if (data) setMovie(data);
        setLoading(false);
    }

    const getMovieCredits = async id => {
        const data = await fetchMovieCredits(id);
        // console.log('got credits: ', data);
        if(data && data.cast) setCast(data.cast);
    }
    
    const getSimilarMovies = async id => {
        const data = await fetchSimilarMovies(id);
        // console.log('got similar movies: ', data);
        if(data && data.results) setSimilarMovies(data.results);
    }


    return (
        <ScrollView
            contentContainerStyle={{paddingBottom: 20}}
            className="flex-1 bg-neutral-900"
        >
            {/* Back button and movie poster  */}
            <View className="w-full">
                <SafeAreaView className={"absolute z-20 w-full flex-row justify-between items-center px-4"+topMargin}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.background} className="rounded-xl p-1">
                        <ChevronLeftIcon size="28" strokeWidth={2.5} color="white" />
                    </Pressable>
                    <Pressable onPress={() => toggleFavourite(!isFavourite)}>
                        <HeartIcon size="35" color={isFavourite? theme.background : "white"} />
                    </Pressable>
                </SafeAreaView>
                {
                    loading? (
                        <Loading />
                    ) : (

                        <View>
                            <Image
                                // source={require('../assets/dune2.jpg')}
                                source = {{uri: image500(movie?.poster_path) || fallbackMoviePoster}}
                                style={{width, height: height*0.55}}    
                            />   
                            <LinearGradient 
                                colors={['transparent', 'rgba(23,23,23,0.1)', 'rgba(23,23,23,1)']}
                                style={{width, height: height*0.40}}
                                start={{x: 0.5, y: 0}}
                                end={{x: 0.5, y: 1}}
                                className="absolute bottom-0"
                            />
                        </View>

                    )
                }
            </View>   

            {/* movie details*/}    

            <View style={{marginTop: -(height*0.09)}} className="space-y-3">
                {/* title */}
                <Text className="text-white text-center text-3xl font-bold tracking-wider">
                    {
                        movie?.title
                    }
                </Text>
                    {/* status, release, runtime */}
                    {
                        movie?.id?(
                            <Text className="text-neutral-400 font-semibold text-base text-center">
                                {movie?.status} - {movie?.release_date?.split('-')[0]} - {movie?.runtime} min
                            </Text>
                        ):null
                    }

                {/* genres */}
                <View className="flex-row justify-center mx-4 space-x-2">
                        {
                            movie?.genres?.map((genre, index) => {
                                let showDot = index + 1 != movie.genres.length;
                                return (
                                    <Text key={index} className="text-neutral-400 font-semibold text-base text-center">
                                    {genre?.name} {showDot? "-":null}
                                    </Text>
                                )
                            })
                        }
                </View>
                {/* description */}
                <Text className="text-neutral-400 mx-4 tracking-wide">
                    {
                        movie?.overview
                    }
                </Text>                
            </View>

            {/* Cast */}

            {cast && cast.length > 0 && <Cast navigation={navigation} cast={cast} /> }

            
            {/* Similar Movies */}

            {similarMovies && similarMovies.length > 0 && <MovieList title="Similar Movies" hideSeeAll={true} data={similarMovies}/> }

            

        </ScrollView>
    )
}