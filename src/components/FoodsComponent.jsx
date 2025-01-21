import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useUserContext from "../hooks/useUserContext.js";
import {
    Box,
    Button,
    TextField,
    Typography,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Collapse,
    Grid2 as Grid
} from "@mui/material";
import {ExpandMore, ExpandLess} from "@mui/icons-material";

export const FoodsComponent = ({ ownerId }) => {
    const [foodsWithoutCategories, setFoodsWithoutCategories] = useState([]);
    const [foodCategories, setFoodCategories] = useState([]);
    const [newFood, setNewFood] = useState({ name: "", description: "", expirationDate: "", purchaseDate: "", foodCategoryId: '', quantity: 1 , isClaimable: false});
    const [newCategory, setNewCategory] = useState({ name: "", description: "" });
    const [showAddFoodForm, setShowAddFoodForm] = useState(false);
    const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
    const [showAddFoodToCategoryForm, setShowAddFoodToCategoryForm] = useState(false);
    const [selectedFoodId, setSelectedFoodId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [openCategory, setOpenCategory] = useState({});
    const { user } = useUserContext();
    const activeUserId = user?.id;
    const userId = ownerId || activeUserId;

    useEffect(() => {
        const fetchFoodsWithoutCategories = async () => {
            const response = await fetch(`http://localhost:5179/foodswithoutcategory/${userId}`);
            const data = await response.json();
            console.log(data);
            setFoodsWithoutCategories(data);
        };

        const fetchFoodCategories = async () => {
            const response = await fetch(`http://localhost:5179/foodcategories/${userId}`);
            const data = await response.json();
            console.log(data);
            setFoodCategories(data);
        };

        if (userId) {
            fetchFoodsWithoutCategories().catch(error => console.error('Error fetching foods without categories:', error));
            fetchFoodCategories().catch(error => console.error('Error fetching food categories:', error));
        } else {
            console.error('User ID is not available');
        }
    }, [userId]);

    const handleClaimableChangeNoCategory = async (foodId, claimable) => {
        console.log({ foodId, claimable });
        const response = await fetch(`http://localhost:5179/fooditems/${foodId}/${claimable}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            setFoodsWithoutCategories(foodsWithoutCategories.map(food => food.id === foodId ? { ...food, isClaimable: claimable } : food));
        } else {
            console.error('Failed to update claimable status');
        }
    }

    const handleClaimableChangeWithCategory = async (foodId, categoryId, claimable) => {
        const response = await fetch(`http://localhost:5179/fooditems/${foodId}/${claimable}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            const categoryIndex = foodCategories.findIndex(category => category.id === categoryId);
            if (categoryIndex >= 0) {
                const updatedCategory = foodCategories[categoryIndex];
                updatedCategory.foods = updatedCategory.foods.map(food => food.id === foodId ? { ...food, claimable } : food);
                setFoodCategories([...foodCategories.slice(0, categoryIndex), updatedCategory, ...foodCategories.slice(categoryIndex + 1)]);
            }
        } else {
            console.error('Failed to update claimable status');
        }
    }

    const handleAddFood = async () => {
        console.log(newFood);
        const response = await fetch(`http://localhost:5179/fooditems/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newFood),
        });

        if (response.ok) {
            const categoryIndex = foodCategories.findIndex(category => category.id === newFood.foodCategoryId);
            if (categoryIndex >= 0) {
                const updatedCategory = foodCategories[categoryIndex];
                updatedCategory.foods = updatedCategory.foods || [];
                updatedCategory.foods.push(newFood);
                setFoodCategories([...foodCategories.slice(0, categoryIndex), updatedCategory, ...foodCategories.slice(categoryIndex + 1)]);
            } else {
                setFoodsWithoutCategories([...foodsWithoutCategories, newFood]);
            }
        } else {
            console.error('Failed to add food');
        }
        setNewFood({ name: "", description: "", expirationDate: "", purchaseDate: "", foodCategoryId: "", quantity: 1, isClaimable: false });
    };

    const handleAddCategory = async () => {
        const response = await fetch(`http://localhost:5179/foodcategories/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newCategory),
        });
        const data = await response.json();
        setFoodCategories([...foodCategories, data]);
        setNewCategory({ name: "", description: "" });
    };

    const handleAddFoodToCategory = async (foodId, foodCategoryId) => {
        console.log({foodId, foodCategoryId});
        const response = await fetch(`http://localhost:5179/addfoodtocategory`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ foodCategoryId, foodId }),
        });

        console.log(response);

        if (response.ok) {
            const categoryIndex = foodCategories.findIndex(category => category.id === foodCategoryId);
            if (categoryIndex >= 0) {
                const updatedCategory = foodCategories[categoryIndex];
                updatedCategory.foods = updatedCategory.foods || [];
                const food = foodsWithoutCategories.find(food => food.id === foodId);
                if (food) {
                    updatedCategory.foods.push(food);
                    setFoodCategories([...foodCategories.slice(0, categoryIndex), updatedCategory, ...foodCategories.slice(categoryIndex + 1)]);
                    setFoodsWithoutCategories(foodsWithoutCategories.filter(food => food.id !== foodId));
                }
            }
        } else {
            console.error('Failed to add food to category');
        }
    };

    const handleAddFoodToCategoryFormSubmit = async (event) => {
        event.preventDefault();
        await handleAddFoodToCategory(selectedFoodId, selectedCategoryId);
        setSelectedFoodId('');
        setSelectedCategoryId('');
    };

    const handleToggle = (categoryId) => {
        setOpenCategory((prevOpenCategory) => ({
            ...prevOpenCategory,
            [categoryId]: !prevOpenCategory[categoryId],
        }));
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4">Foods</Typography>
            <Grid container spacing={2}>
                {foodsWithoutCategories.map((food) => (
                    <Grid item xs={12} sm={6} md={4} key={food.id} >
                        <Box border={1} borderRadius={2} padding={2} textAlign="center">
                            <Typography variant="h6">{food.name}</Typography>
                            <Typography>{food.description}</Typography>
                            <Typography>Expiration Date: {new Date(food.expirationDate).toLocaleDateString()}</Typography>
                            <Typography>Purchase Date: {new Date(food.purchaseDate).toLocaleDateString()}</Typography>
                            <Typography component="div">Quantity: {food.quantity}</Typography>
                            <FormControlLabel
                                control={<Checkbox checked={food.isClaimable} onChange={(e) => handleClaimableChangeNoCategory(food.id, e.target.checked)} />}
                                label="Is Claimable"
                            />
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <FormControlLabel
                control={<Checkbox checked={showAddFoodForm} onChange={() => setShowAddFoodForm(!showAddFoodForm)} />}
                label="Add Food"
            />

            {showAddFoodForm && (
                <Box sx={{ width: '50%', marginTop: 2 }}>
                    <Typography variant="h6">Add Food</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Name"
                                value={newFood.name}
                                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                value={newFood.description}
                                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Expiration Date"
                                focused={true}
                                type="date"
                                value={newFood.expirationDate}
                                onChange={(e) => setNewFood({ ...newFood, expirationDate: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Purchase Date"
                                focused={true}
                                type="date"
                                value={newFood.purchaseDate}
                                onChange={(e) => setNewFood({ ...newFood, purchaseDate: e.target.value })}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Quantity"
                                type="number"
                                value={newFood.quantity}
                                onChange={(e) => setNewFood({ ...newFood, quantity: parseInt(e.target.value, 10) })}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                            <FormControl fullWidth={true} margin="normal">
                                <InputLabel>Category</InputLabel>
                                <Select fullWidth
                                    value={newFood.foodCategoryId}
                                    onChange={(e) => setNewFood({ ...newFood, foodCategoryId: e.target.value })}
                                >
                                    {foodCategories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button variant="contained" color="primary" onClick={handleAddFood}>
                                Add Food
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            )}
            <Typography variant="h4" sx={{ marginTop: 4 }}>Food Categories</Typography>
            <Grid container spacing={2}>
                {foodCategories.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.id}>
                        <Box border={1} borderRadius={2} padding={2} textAlign="center">
                            <Typography variant="h6">
                                {category.name}
                                {category.foods?.length > 0 && (
                                    <IconButton onClick={() => handleToggle(category.id)}>
                                        {openCategory[category.id] ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                )}
                            </Typography>
                            <Typography variant="body2">{category.description}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            {foodCategories.map((category) => (
                <Collapse in={openCategory[category.id]} timeout="auto" unmountOnExit key={category.id}>
                    <Grid container spacing={2} component="div" >
                        {category.foods?.map((food) => (
                            <Grid item xs={12} sm={6} md={4} key={food.id} sx={{ pl: 4 }}>
                                <Box border={1} borderRadius={2} padding={2} textAlign="center">
                                    <Typography variant="h6">{food.name}</Typography>
                                    <Typography>{food.description}</Typography>
                                    <Typography component="div">Expiration Date: {new Date(food.expirationDate).toLocaleDateString()}</Typography>
                                    <Typography component="div">Purchase Date: {new Date(food.purchaseDate).toLocaleDateString()}</Typography>
                                    <Typography component="div">Quantity: {food.quantity}</Typography>
                                    <FormControlLabel
                                        control={<Checkbox checked={food.isClaimable} onChange={(e) => handleClaimableChangeWithCategory(food.id, category.id, e.target.checked)} />}
                                        label="Is Claimable"
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Collapse>
            ))}
            <FormControlLabel
                control={<Checkbox checked={showAddCategoryForm} onChange={() => setShowAddCategoryForm(!showAddCategoryForm)} />}
                label="Add Category"
            />
            {showAddCategoryForm && (
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6">Add Category</Typography>
                    <TextField
                        label="Name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" color="primary" onClick={handleAddCategory}>
                        Add Category
                    </Button>
                </Box>
            )}
            <FormControlLabel
                control={<Checkbox checked={showAddFoodToCategoryForm} onChange={() => setShowAddFoodToCategoryForm(!showAddFoodToCategoryForm)} />}
                label="Add Food to Category"
            />
            {showAddFoodToCategoryForm && (
                <Box sx={{ marginTop: 2 }}>
                    <Typography variant="h6">Add Food to Category</Typography>
                    <form onSubmit={handleAddFoodToCategoryFormSubmit}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Food</InputLabel>
                            <Select
                                value={selectedFoodId}
                                onChange={(e) => setSelectedFoodId(e.target.value)}
                            >
                                {foodsWithoutCategories.map((food) => (
                                    <MenuItem key={food.id} value={food.id}>
                                        {food.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                {foodCategories.map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button variant="contained" color="primary" type="submit">
                            Add Food to Category
                        </Button>
                    </form>
                </Box>
            )}
        </Box>
    );
};

FoodsComponent.propTypes = {
    ownerId: PropTypes.string,
};