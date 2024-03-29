import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, Alert, TextInput, ActivityIndicator } from 'react-native'

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

import { styles } from './styles'
import Colors from '../../constants/ColorConstants';
import { Button2, ListCard, AppLoader } from '../../components'

import { deletListItem, getTodoList } from '../../redux/todoSlice/todoSlice';
import { resetTodoList } from '../../redux/todoSlice/todoSlice';

export const Home = (props) => {
  const dispatch = useDispatch();
  const focused = useIsFocused();

  const state = useSelector((state) => state);
  const { todoReducer } = state;

  const [data, setData] = useState(null);
  const [current, setCurrent] = useState(null)
  const [isLoading, setIsLoading] = useState(null);

  //Pagination State
  const [page, setPage] = useState(1)
  const [endPage, setEndPage] = useState(0)
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    // dispatch(resetTodoList())
    setPage(1);
    if (focused) {
      loadList()
      setIsLoading(true)
    }
  }, [focused]);

  useEffect(() => {
    if (todoReducer?.todoList?.length > 0) {
      setData(todoReducer?.todoList)
      setCurrent(todoReducer?.todoList)
    }
    setEndPage(todoReducer?.endPage)
    setTimeout(() => {
      setLoading(false);
      setIsLoading(false)
    }, 1000);
  }, [todoReducer?.todoList])

  const loadList = () => {
    // setData([])
    const body = { params: { page: 1 } }
    dispatch(getTodoList(body))
  }

  const loadMoreList = () => {
    setLoading(true);
    const body = { params: { page: page + 1 } }
    dispatch(getTodoList(body))
    setPage(page + 1);
  };


  const removeAlert = (id) =>
    Alert.alert(
      "Delete Item ?",
      "Are you sure you want to delete this item?",
      [
        { text: "Cancel" },
        { text: "OK", onPress: () => removeItem(id) },
      ]
    );

  const removeItem = (id) => {
    dispatch(deletListItem(id)).then((res) => {
      if (res?.payload?.success) {
        loadList()
        setIsLoading(true)
      }
    })

  }

  const searchData = (x) => {
    let text = x.toLowerCase();

    let filtered = current.filter((item) => {
      return item?.title?.toLowerCase()?.match(text);
    });
    setData(filtered);
  };

  const renderFooter = () => {
    return loading ? (
      <View>
        <ActivityIndicator
          size={"large"}
          color={Colors.theme}
          style={{ marginBottom: hp(8) }}
        />
      </View>
    ) : null;
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={{ marginBottom: data?.length - 1 === index && !loading ? hp(10) : 0 }}>
        <ListCard item={item}
          onRemove={() => (removeAlert(item?.id))}
          onEdit={() => props?.navigation?.navigate("CreateItem", item)} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <View style={styles?.topSection}>
        <TextInput
          style={styles.input}
          placeholder="Search by title..."
          placeholderTextColor={Colors.black}
          onChangeText={(val) => searchData(val)}
        />
        <Button2
          IconButton={false}
          ButtonName={"Add"}
          ButtonType="Outlined"
          style={styles.button}
          TextColor={Colors.white}
          OutlineColor={Colors.theme}
          TextStyle={styles.buttonText}
          ButtonBackground={Colors.theme}
          onPress={() => props?.navigation?.navigate("CreateItem")}
        />
      </View>

      {data?.length ? <View>
        <FlatList
          data={data}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item?.id?.toString()}
          style={{ paddingHorizontal: wp(3), paddingTop: hp(1) }}
          onEndReached={() => {
            if (endPage !== page) {
              if (!loading && todoReducer?.todoList.length != 0) {
                setLoading(true)
                loadMoreList();
              }
            }
          }}
        />
      </View> :
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>No Data Found.</Text>
        </View>}

      {isLoading && <AppLoader visible={isLoading} />}
    </View>
  )
}
