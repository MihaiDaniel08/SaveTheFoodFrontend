import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Collapse,
    Tabs,
    Tab,
    Drawer,
    AppBar,
    Toolbar,
    Divider
} from '@mui/material';
import { ExpandMore, ExpandLess, Delete } from '@mui/icons-material';
import useUserContext from "../hooks/useUserContext.js";

const FriendsComponent = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [friendGroups, setFriendGroups] = useState([]);
    const [friends, setFriends] = useState([]);
    const [newFriendEmail, setNewFriendEmail] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [openGroup, setOpenGroup] = useState({});
    const { user } = useUserContext();
    const activeUserId = user?.id;

    useEffect(() => {
        const fetchFriends = async () => {
            const response = await fetch(`http://localhost:5179/friends/${activeUserId}`);
            const friends = await response.json();
            setFriends(friends);
        };

        const fetchFriendGroups = async () => {
            const response = await fetch(`http://localhost:5179/friendgroups/${activeUserId}`);
            const friendGroups = await response.json();
            setFriendGroups(friendGroups);
            console.log(friendGroups);
            setOpenGroup(friendGroups.reduce((acc, group) => ({ ...acc, [group.id]: false }), {}));
        }

        fetchFriends();
        fetchFriendGroups();
    }, [activeUserId]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleToggleGroup = (groupId) => {
        setOpenGroup((prevOpenGroup) => ({
            ...prevOpenGroup,
            [groupId]: !prevOpenGroup[groupId],
        }));
    };

    const handleAddFriend = async () => {
        let friendEmail = newFriendEmail;
        console.log(friendEmail);
        const response = await fetch(`http://localhost:5179/friends/${activeUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {friendEmail} ),
        });
        const newFriend = await response.json();
        setFriends([...friends, newFriend]);
        setNewFriendEmail('');
    };

    const handleAddFriendToGroup = async (groupId, friendEmail) => {
        const response = await fetch(`http://localhost:5179/friendgroups/${groupId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {friendEmail} ),
        });
        if (response.ok) {
            const updatedGroups = friendGroups.map(group => {
                if (group.id === groupId) {
                    return { ...group, friends: [...group.friends, { email: friendEmail }] };
                }
                return group;
            });
            setFriendGroups(updatedGroups);
        }
        else {
            alert('Friend not found');
        }
    };

    const handleRemoveFriendFromGroup = async (groupId, friendEmail) => {
        const response = await fetch(`http://localhost:5179/friendgroups/${groupId}/${friendEmail}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            const updatedGroups = friendGroups.map(group => {
                if (group.id === groupId) {
                    return { ...group, friends: group.friends.filter(friend => friend.email !== friendEmail) };
                }
                return group;
            }
            );
            setFriendGroups(updatedGroups);
        }
    };

    const handleAddFriendGroup = async () => {
        const response = await fetch(`http://localhost:5179/friendgroups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: activeUserId, name: newGroupName }),
        });
        const newGroup = await response.json();
        setFriendGroups([...friendGroups, newGroup]);
        setNewGroupName('');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer variant="permanent" anchor="right">
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6">Friends</Typography>
                    </Toolbar>
                </AppBar>
                <Tabs value={tabIndex} onChange={handleTabChange} orientation="vertical">
                    <Tab label="Friend Groups" />
                    <Tab label="Friends" />
                </Tabs>
                <Divider />
                <Box sx={{ padding: 2, width: 250 }}>
                    {tabIndex === 0 && (
                        <List>
                            {friendGroups.map((group) => (
                                <Box key={group.id}>
                                    <ListItem button onClick={() => handleToggleGroup(group.id)}>
                                        <ListItemText primary={group.name} />
                                        {openGroup[group.id] ? <ExpandLess /> : <ExpandMore />}
                                    </ListItem>
                                    <Collapse in={openGroup[group.id]} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {group.friends?.map((friend) => (
                                                <ListItem key={friend.id} sx={{ pl: 4 }}>
                                                    <ListItemText primary={friend.name} />
                                                    <IconButton onClick={() => handleRemoveFriendFromGroup(group.id, friend.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </ListItem>
                                            ))}
                                            <ListItem>
                                                <TextField
                                                    label="Add Friend by email"
                                                    fullWidth
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddFriendToGroup(group.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                            </ListItem>
                                        </List>
                                    </Collapse>
                                </Box>
                            ))}
                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    label="New Group Name"
                                    fullWidth
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                                <Button variant="contained" color="primary" onClick={handleAddFriendGroup} sx={{ mt: 1 }}>
                                    Add Friend Group
                                </Button>
                            </Box>
                        </List>
                    )}
                    {tabIndex === 1 && (
                        <Box>
                            <List>
                                {friends.map((friend) => (
                                    <ListItem key={friend.id}>
                                        <ListItemText primary={friend.name} secondary={friend.email} />
                                    </ListItem>
                                ))}
                            </List>
                            <TextField
                                label="Add Friend by Email"
                                fullWidth
                                value={newFriendEmail}
                                onChange={(e) => setNewFriendEmail(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddFriend();
                                    }
                                }}
                            />
                            <Button variant="contained" color="primary" onClick={handleAddFriend} sx={{ mt: 2 }}>
                                Add Friend
                            </Button>
                        </Box>
                    )}
                </Box>
            </Drawer>
        </Box>
    );
};

export default FriendsComponent;